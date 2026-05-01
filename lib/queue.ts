import { Queue, Worker } from "bullmq";
import { redis } from "./redis";
import { syncStatementFromS3 } from "./statement/sync-service";
import { exportStatement } from "./statement/export-service";

export const syncQueue = new Queue("statement-sync", { connection: redis });
export const exportQueue = new Queue("statement-export", { connection: redis });

export function startWorker() {
  const syncWorker = new Worker(
    "statement-sync",
    async (job) => {
      const { year, month, server, force, createdBy } = job.data;
      return await syncStatementFromS3({ year, month, server, force, createdBy });
    },
    { connection: redis, concurrency: 1 }
  );

  const exportWorker = new Worker(
    "statement-export",
    async (job) => {
      const { title, year, month, server, accounts, createdBy } = job.data;
      return await exportStatement({ title, year, month, server, accounts, createdBy });
    },
    { connection: redis, concurrency: 1 }
  );

  syncWorker.on("completed", (job) => {
    console.log(`[Sync] Job ${job.id} completed`);
  });

  syncWorker.on("failed", (job, err) => {
    console.error(`[Sync] Job ${job?.id} failed:`, err.message);
  });

  exportWorker.on("completed", (job) => {
    console.log(`[Export] Job ${job.id} completed`);
  });

  exportWorker.on("failed", (job, err) => {
    console.error(`[Export] Job ${job?.id} failed:`, err.message);
  });

  console.log("[Queue] Workers started for sync and export");
  return { syncWorker, exportWorker };
}
