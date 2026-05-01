import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { buildStatementFileName, extractStatementDateToken } from "@/lib/statement/patterns";
import { cacheGet, cacheSet } from "@/lib/cache";

type CachedStatementFile = {
  localPath: string | null;
  s3Key: string;
  serverName: string;
};

function normalizeDateToken(value: string) {
  const clean = value.replaceAll("-", "").trim();
  if (!/^\d{8}$/.test(clean)) return null;
  return clean;
}

function shiftDateToken(dateToken: string, days: number) {
  const year = Number(dateToken.slice(0, 4));
  const month = Number(dateToken.slice(4, 6)) - 1;
  const day = Number(dateToken.slice(6, 8));
  const d = new Date(Date.UTC(year, month, day));
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sesi Anda sudah berakhir. Silakan login kembali." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const account = (searchParams.get("account") || "").trim();
  const year = (searchParams.get("year") || "").trim();
  const month = (searchParams.get("month") || "").trim().padStart(2, "0");
  const date = normalizeDateToken(searchParams.get("date") || "");
  const rangeStart = normalizeDateToken(searchParams.get("rangeStart") || "");
  const rangeEnd = normalizeDateToken(searchParams.get("rangeEnd") || "");
  const lookbackDays = Math.max(0, Number(searchParams.get("lookbackDays") || "0"));
  const shouldDownload = searchParams.get("download") === "1";

  if (!/^\d+$/.test(account) || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    return NextResponse.json({ message: "Data pencarian belum lengkap." }, { status: 400 });
  }

  if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
    return NextResponse.json({ message: "Range tanggal tidak valid." }, { status: 400 });
  }

  // Gunakan cache untuk query statementFile
  const cacheKey = `statement:files:${year}:${month}`;
  let files = await cacheGet<CachedStatementFile[]>(cacheKey);
  
  if (!files) {
    files = await prisma.statementFile.findMany({
      where: {
        periodYear: year,
        periodMonth: month,
        syncStatus: "synced",
        localPath: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });
    await cacheSet(cacheKey, files, 120); // cache 2 menit
  }

  const targetFileName = buildStatementFileName(account);

  for (const item of files) {
    if (!item.localPath) continue;
    if (!existsSync(item.localPath)) continue;

    try {
      const zip = new AdmZip(item.localPath);
      const entry = zip
        .getEntries()
        .find((zipItem) => {
          const name = zipItem.entryName.split("/").pop() || "";
          return name === targetFileName;
        });

      if (!entry) continue;

      const statementDate = extractStatementDateToken(item.s3Key) || `${year}${month}01`;

      const inRange = rangeStart && rangeEnd
        ? statementDate >= rangeStart && statementDate <= rangeEnd
        : false;

      const isSpecificDate = date ? statementDate === date : false;

      const inLookbackWindow = date && lookbackDays > 0
        ? statementDate >= shiftDateToken(date, -lookbackDays) && statementDate <= date
        : false;

      if (rangeStart && rangeEnd) {
        if (!inRange) continue;
      } else if (date && lookbackDays > 0) {
        if (!inLookbackWindow) continue;
      } else if (date) {
        if (!isSpecificDate) continue;
      }

      const statementTime = new Date().toTimeString().slice(0, 8).replaceAll(":", "");
      const fileName = `${account}_${statementDate}_${statementTime}.htm`;

      if (!shouldDownload) {
        const baseParams = new URLSearchParams({
          account,
          year,
          month,
        });
        if (date) baseParams.set("date", date);
        if (rangeStart) baseParams.set("rangeStart", rangeStart);
        if (rangeEnd) baseParams.set("rangeEnd", rangeEnd);
        if (lookbackDays > 0) baseParams.set("lookbackDays", String(lookbackDays));

        return NextResponse.json({
          found: true,
          account,
          year,
          month,
          statementDate,
          serverName: item.serverName,
          fileName,
          downloadUrl: `/api/statement/search?${baseParams.toString()}&download=1`,
        });
      }

      return new NextResponse(new Uint8Array(entry.getData()), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    found: false,
    message: "Statement tidak ditemukan untuk account dan periode ini.",
  }, { status: 404 });
}
