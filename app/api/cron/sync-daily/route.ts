import { NextResponse } from "next/server";
import { syncStatementFromS3 } from "@/lib/statement/sync-service";

function getJakartaYearMonth(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return { year: year || "", month: month || "" };
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { year, month } = getJakartaYearMonth();

  const result = await syncStatementFromS3({
    year,
    month,
    force: false,
    createdBy: "system-cron",
  });

  return NextResponse.json({
    trigger: "daily-cron",
    timezone: "Asia/Jakarta",
    year,
    month,
    ...result,
  });
}
