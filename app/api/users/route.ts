import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

const createUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]).default("OPERATOR"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sesi Anda sudah berakhir. Silakan login kembali." }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
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

  return NextResponse.json({ users: users.map((item) => ({ ...item, id: item.id.toString() })) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Anda tidak memiliki akses untuk menambah user." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data user baru belum lengkap atau formatnya belum sesuai." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    return NextResponse.json({ message: "Username sudah digunakan. Silakan gunakan username lain." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
      isActive: true,
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

  return NextResponse.json({ user: { ...created, id: created.id.toString() } }, { status: 201 });
}
