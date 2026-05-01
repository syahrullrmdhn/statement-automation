import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { syncStatementFromS3 } from "@/lib/statement/sync-service";

const schema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  server: z.string().optional(),
  force: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Sesi Anda sudah berakhir. Silakan login kembali." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Data input sinkronisasi belum lengkap atau formatnya belum sesuai." }, { status: 400 });
  }

  let createdJobId = "";

  // Jalankan sync di background, response langsung cepat
  const jobPromise = syncStatementFromS3({
    fromDate: parsed.data.fromDate,
    toDate: parsed.data.toDate,
    server: parsed.data.server === "ALL" ? undefined : parsed.data.server,
    force: parsed.data.force,
    createdBy: user.username,
    onJobCreated: (jobId) => {
      createdJobId = jobId;
    },
  });

  // Tidak perlu await — biar jalan di background
  // Tapi kita perlu jobId yang sudah dibuat
  const start = Date.now();
  while (!createdJobId && Date.now() - start < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  // Jangan await jobPromise — background processing
  jobPromise.catch(() => null);

  return NextResponse.json({
    jobId: createdJobId || null,
    done: false,
    message: "Sinkronisasi dimulai. Anda bisa pindah halaman.",
  });
}
