import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { buildStatementFileName, extractStatementDateToken } from "@/lib/statement/patterns";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sesi Anda sudah berakhir. Silakan login kembali." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const account = (searchParams.get("account") || "").trim();
  const year = (searchParams.get("year") || "").trim();
  const month = (searchParams.get("month") || "").trim().padStart(2, "0");
  const shouldDownload = searchParams.get("download") === "1";

  if (!account || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    return NextResponse.json({ message: "Data pencarian belum lengkap." }, { status: 400 });
  }

  // Gunakan cache untuk query statementFile
  const cacheKey = `statement:files:${year}:${month}`;
  let files = await cacheGet<any[]>(cacheKey);
  
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
        .find((zipItem) => zipItem.entryName.endsWith(targetFileName));

      if (!entry) continue;

      const statementDate = extractStatementDateToken(item.s3Key) || `${year}${month}01`;
      const statementTime = new Date().toTimeString().slice(0, 8).replaceAll(":", "");
      const fileName = `${account}_${statementDate}_${statementTime}.htm`;

      if (!shouldDownload) {
        return NextResponse.json({
          found: true,
          account,
          year,
          month,
          serverName: item.serverName,
          fileName,
          downloadUrl: `/api/statement/search?account=${encodeURIComponent(account)}&year=${year}&month=${month}&download=1`,
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
