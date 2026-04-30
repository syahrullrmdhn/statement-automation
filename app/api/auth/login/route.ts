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

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

const loginAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function buildRateLimitKey(req: Request, username: string) {
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  return `${ip}:${username.toLowerCase()}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const item = loginAttempts.get(key);

  if (!item) return false;

  if (now - item.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }

  return item.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

function registerFailedAttempt(key: string) {
  const now = Date.now();
  const item = loginAttempts.get(key);

  if (!item || now - item.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  loginAttempts.set(key, {
    count: item.count + 1,
    firstAttemptAt: item.firstAttemptAt,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const rateLimitKey = buildRateLimitKey(req, parsed.data.username);
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { message: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });

  if (!user || !user.isActive) {
    registerFailedAttempt(rateLimitKey);
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
    registerFailedAttempt(rateLimitKey);
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

  loginAttempts.delete(rateLimitKey);

  return response;
}
