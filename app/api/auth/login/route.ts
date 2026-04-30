import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  getSessionMaxAgeSeconds,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { message: "Username atau password salah" },
      { status: 401 }
    );
  }

  const isValidPassword = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash
  );

  if (!isValidPassword) {
    return NextResponse.json(
      { message: "Username atau password salah" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    userId: user.id.toString(),
    username: user.username,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({
    user: {
      id: user.id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
    },
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  return response;
}