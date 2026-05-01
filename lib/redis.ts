import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const createRedis = () => {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 5) return null; // stop retrying after 5 attempts
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  client.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return client;
};

export const redis = createRedis();

// Connect lazily — first usage will trigger connection
let connecting: Promise<void> | null = null;
export async function ensureRedis() {
  if (redis.status === "ready") return true;
  if (redis.status === "connecting" || redis.status === "connect") {
    return new Promise((resolve) => {
      redis.once("ready", () => resolve(true));
      redis.once("error", () => resolve(false));
    });
  }
  if (!connecting) {
    connecting = redis.connect().then(() => {
      connecting = null;
    }).catch((err) => {
      connecting = null;
      console.error("[Redis] Connection failed:", err.message);
    });
  }
  return connecting.then(() => redis.status === "ready").catch(() => false);
}
