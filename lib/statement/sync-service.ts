import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { basename, join } from "path";
import { s3Client } from "@/lib/s3/client";
import { downloadS3Object } from "@/lib/s3/download";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/cache";
import { matchesStatementDateRange, extractDateFromFileName } from "./patterns";

type SyncParams = {
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  server?: string;
  force?: boolean;
  createdBy?: string;
  onJobCreated?: (jobId: string) => void;
};

type S3Candidate = {
  key: string;
  fileName: string;
  etag?: string;
  size: number;
  lastModified?: Date;
};

type CachedS3ListResult = {
  Contents?: Array<{
    Key?: string;
    ETag?: string;
    Size?: number;
    LastModified?: string;
  }>;
  NextContinuationToken?: string;
};

export async function syncStatementFromS3(params: SyncParams) {
  const bucket = process.env.S3_BUCKET!;
  const configuredPrefix = process.env.S3_STATEMENT_PREFIX || "";
  const storagePath = process.env.APP_STORAGE_PATH || "./storage";
  const prefixes = buildPrefixCandidates(configuredPrefix);

  // Derive year/month from fromDate for backward compatibility in DB
  const fromYear = params.fromDate.slice(0, 4);
  const fromMonth = params.fromDate.slice(5, 7);

  const syncJob = await prisma.syncJob.create({
    data: {
      periodYear: fromYear,
      periodMonth: fromMonth,
      serverName: params.server,
      mode: "manual",
      status: "running",
      startedAt: new Date(),
      createdBy: params.createdBy,
    },
  });

  params.onJobCreated?.(syncJob.id.toString());

  let totalFound = 0;
  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let usedPrefix = prefixes[0] || "";
  const candidates: S3Candidate[] = [];

  try {
    for (const prefix of prefixes) {
      let continuationToken: string | undefined;
      let seenObjects = 0;
      let isComplete = false;

      do {
        // Cache key untuk S3 listing (prefix + continuationToken)
        const s3CacheKey = `s3:list:${bucket}:${prefix}:${continuationToken || "first"}`;
        let result = await cacheGet<CachedS3ListResult>(s3CacheKey);

        if (!result) {
          const rawResult = await s3Client.send(
            new ListObjectsV2Command({
              Bucket: bucket,
              Prefix: prefix,
              ContinuationToken: continuationToken,
            })
          );
          result = {
            Contents: rawResult.Contents?.map((obj) => ({
              Key: obj.Key,
              ETag: obj.ETag,
              Size: Number(obj.Size),
              LastModified: obj.LastModified?.toISOString(),
            })),
            NextContinuationToken: rawResult.NextContinuationToken,
          };
          // S3 listing cache 3 menit (tidak sering berubah)
          await cacheSet(s3CacheKey, result, 180);
        }

        seenObjects += result.Contents?.length || 0;

        for (const object of result.Contents || []) {
          if (!object.Key) continue;

          const key = object.Key;
          const fileName = basename(key);

          if (!matchesStatementDateRange(fileName, params.fromDate, params.toDate)) {
            continue;
          }

          if (params.server && !key.includes(`/${params.server}/`)) {
            continue;
          }

          candidates.push({
            key,
            fileName,
            etag: object.ETag?.replaceAll('"', ""),
            size: Number(object.Size || 0),
            lastModified: object.LastModified ? new Date(object.LastModified) : undefined,
          });
        }

        continuationToken = result.NextContinuationToken;
        isComplete = !result.NextContinuationToken;
      } while (!isComplete);

      if (seenObjects > 0) {
        usedPrefix = prefix;
        break;
      }
    }

    totalFound = candidates.length;
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: { totalFound },
    });

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const existing = await prisma.statementFile.findUnique({
        where: { s3Key: candidate.key },
      });

      const unchanged =
        existing &&
        existing.s3Etag === candidate.etag &&
        Number(existing.fileSize || 0) === candidate.size;

      if (unchanged && !params.force) {
        totalSkipped++;
      } else {
        try {
          const serverName = extractServerName(candidate.key, usedPrefix);
          // Extract file date for folder structure
          const fileDate = extractDateFromFileName(candidate.fileName);
          const fileYear = fileDate ? fileDate.slice(0, 4) : fromYear;
          const fileMonth = fileDate ? fileDate.slice(5, 7) : fromMonth;

          const localPath = join(
            storagePath,
            "s3-cache",
            serverName,
            fileYear,
            fileMonth,
            candidate.fileName
          );

          await downloadS3Object({ bucket, key: candidate.key, localPath });

          await prisma.statementFile.upsert({
            where: { s3Key: candidate.key },
            create: {
              serverName,
              periodYear: fileYear,
              periodMonth: fileMonth,
              s3Bucket: bucket,
              s3Key: candidate.key,
              s3Etag: candidate.etag,
              s3LastModified: candidate.lastModified,
              fileSize: BigInt(candidate.size),
              localPath,
              syncStatus: "synced",
            },
            update: {
              s3Etag: candidate.etag,
              s3LastModified: candidate.lastModified,
              fileSize: BigInt(candidate.size),
              localPath,
              syncStatus: "synced",
            },
          });

          totalDownloaded++;
        } catch {
          totalFailed++;
        }
      }

      if ((i + 1) % 10 === 0 || i + 1 === candidates.length) {
        await prisma.syncJob.update({
          where: { id: syncJob.id },
          data: {
            totalDownloaded,
            totalSkipped,
            totalFailed,
          },
        });
      }
    }

    // Invalidate cache statement files setelah sync
    await cacheSet(`statement:files:${fromYear}:${fromMonth}`, null, 0);

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
