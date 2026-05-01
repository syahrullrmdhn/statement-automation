import { redis, ensureRedis } from "./redis";

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  const ok = await ensureRedis();
  if (!ok) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error("[Cache] get error:", (err as Error).message);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  const ok = await ensureRedis();
  if (!ok) return;
  try {
    const data = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.setex(key, ttlSeconds, data);
    } else {
      await redis.set(key, data);
    }
  } catch (err) {
    console.error("[Cache] set error:", (err as Error).message);
  }
}

export async function cacheDel(key: string): Promise<void> {
  const ok = await ensureRedis();
  if (!ok) return;
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
}

export async function cacheFlushPrefix(prefix: string): Promise<void> {
  const ok = await ensureRedis();
  if (!ok) return;
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // ignore
  }
}
