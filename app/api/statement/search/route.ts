import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { buildStatementFileName, extractStatementDateToken } from "@/lib/statement/patterns";

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

  const files = await prisma.statementFile.findMany({
    where: {
      periodYear: year,
      periodMonth: month,
      syncStatus: "synced",
      localPath: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  const targetFileName = buildStatementFileName(account);

  for (const item of files) {
    if (!item.localPath) continue;
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

    return new NextResponse(entry.getData(), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  return NextResponse.json({
    found: false,
    message: "Statement tidak ditemukan untuk account dan periode ini.",
  }, { status: 404 });
}
