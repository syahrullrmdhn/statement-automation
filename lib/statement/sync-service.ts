import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { basename, join } from "path";
import { s3Client } from "@/lib/s3/client";
import { downloadS3Object } from "@/lib/s3/download";
import { prisma } from "@/lib/db";
import { matchesStatementPeriod } from "./patterns";

type SyncParams = {
  year: string;
  month: string;
  server?: string;
  force?: boolean;
  createdBy?: string;
};

export async function syncStatementFromS3(params: SyncParams) {
  const bucket = process.env.S3_BUCKET!;
  const configuredPrefix = process.env.S3_STATEMENT_PREFIX || "";
  const storagePath = process.env.APP_STORAGE_PATH || "./storage";
  const prefixes = buildPrefixCandidates(configuredPrefix);

  const syncJob = await prisma.syncJob.create({
    data: {
      periodYear: params.year,
      periodMonth: params.month,
      serverName: params.server,
      mode: "manual",
      status: "running",
      startedAt: new Date(),
      createdBy: params.createdBy,
    },
  });

  let totalFound = 0;
  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let usedPrefix = prefixes[0] || "";

  try {
    for (const prefix of prefixes) {
      let continuationToken: string | undefined;
      let seenObjects = 0;

      do {
        const result = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          })
        );

        seenObjects += result.Contents?.length || 0;

        for (const object of result.Contents || []) {
          if (!object.Key) continue;

          const key = object.Key;
          const fileName = basename(key);
          const lowerKey = key.toLowerCase();

          if (!matchesStatementPeriod(fileName, params.year, params.month)) {
            continue;
          }

          if (!lowerKey.includes(`/${params.year}/`)) {
            continue;
          }

          if (params.server && !key.includes(`/${params.server}/`)) {
            continue;
          }

          totalFound++;

          const etag = object.ETag?.replaceAll('"', "");
          const existing = await prisma.statementFile.findUnique({
            where: { s3Key: key },
          });

          const unchanged =
            existing &&
            existing.s3Etag === etag &&
            Number(existing.fileSize || 0) === Number(object.Size || 0);

          if (unchanged && !params.force) {
            totalSkipped++;
            continue;
          }

          try {
            const serverName = extractServerName(key, prefix);
            const localPath = join(
              storagePath,
              "s3-cache",
              serverName,
              params.year,
              params.month,
              fileName
            );

            await downloadS3Object({ bucket, key, localPath });

            await prisma.statementFile.upsert({
              where: { s3Key: key },
              create: {
                serverName,
                periodYear: params.year,
                periodMonth: params.month,
                s3Bucket: bucket,
                s3Key: key,
                s3Etag: etag,
                s3LastModified: object.LastModified,
                fileSize: BigInt(object.Size || 0),
                localPath,
                syncStatus: "synced",
              },
              update: {
                s3Etag: etag,
                s3LastModified: object.LastModified,
                fileSize: BigInt(object.Size || 0),
                localPath,
                syncStatus: "synced",
              },
            });

            totalDownloaded++;
          } catch {
            totalFailed++;
          }
        }

        continuationToken = result.NextContinuationToken;
      } while (continuationToken);

      if (seenObjects > 0) {
        usedPrefix = prefix;
        break;
      }
    }

    const status =
      totalFound === 0 ? "empty" : totalFailed > 0 ? "partial" : "success";

    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status,
        totalFound,
        totalDownloaded,
        totalSkipped,
        totalFailed,
        errorMessage:
          totalFound === 0
            ? `No matching files under prefix: ${usedPrefix}`
            : null,
        finishedAt: new Date(),
      },
    });

    return {
      jobId: syncJob.id.toString(),
      status,
      totalFound,
      totalDownloaded,
      totalSkipped,
      totalFailed,
      usedPrefix,
      message:
        totalFound === 0
          ? "Tidak ada file statement yang cocok. Cek periode, server, dan S3 prefix."
          : undefined,
    };
  } catch (error) {
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        finishedAt: new Date(),
      },
    });

    throw error;
  }
}

function extractServerName(key: string, prefix: string) {
  const cleanKey = key.replace(prefix, "");
  return cleanKey.split("/")[0] || "UNKNOWN";
}

function buildPrefixCandidates(configuredPrefix: string) {
  const normalized = configuredPrefix.trim().replace(/^\/+/, "");
  const candidates = new Set<string>();

  if (normalized) {
    candidates.add(normalized);
    candidates.add(normalized.endsWith("/") ? normalized : `${normalized}/`);
  }

  candidates.add("STATEMENT/");
  candidates.add("s3petisejuk/STATEMENT/");

  return Array.from(candidates);
}
