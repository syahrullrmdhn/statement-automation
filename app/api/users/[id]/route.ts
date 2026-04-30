import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Anda tidak memiliki akses untuk mengubah data user." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Perubahan user belum valid. Mohon cek kembali input Anda." }, { status: 400 });
  }

  const { id } = await context.params;
  const targetId = BigInt(id);

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(typeof parsed.data.isActive === "boolean"
        ? { isActive: parsed.data.isActive }
        : {}),
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user: { ...updated, id: updated.id.toString() } });
}
