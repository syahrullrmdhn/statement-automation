import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "statement_session";

type SessionPayload = {
  userId: string;
  username: string;
  name: string;
  role: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  const maxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS || 7);
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  const result = await jwtVerify(token, getJwtSecret());
  return result.payload as SessionPayload;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function getSessionMaxAgeSeconds() {
  const maxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS || 7);
  return maxAgeDays * 24 * 60 * 60;
}