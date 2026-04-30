import { readFile } from "fs/promises";
import { basename } from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const job = await prisma.exportJob.findUnique({
    where: { id: BigInt(id) },
  });

  if (!job?.outputZipPath) {
    return NextResponse.json(
      { message: "Export file not found" },
      { status: 404 }
    );
  }

  const file = await readFile(job.outputZipPath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${basename(job.outputZipPath)}"`,
    },
  });
}