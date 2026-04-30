import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Sesi Anda sudah berakhir. Silakan login kembali." }, { status: 401 });
  }

  const { id } = await context.params;

  const job = await prisma.syncJob.findUnique({
    where: { id: BigInt(id) },
  });

  if (!job) {
    return NextResponse.json({ message: "Job sinkronisasi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id.toString(),
    status: job.status,
    periodYear: job.periodYear,
    periodMonth: job.periodMonth,
    serverName: job.serverName,
    totalFound: job.totalFound,
    totalDownloaded: job.totalDownloaded,
    totalSkipped: job.totalSkipped,
    totalFailed: job.totalFailed,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    errorMessage: job.errorMessage,
  });
}
