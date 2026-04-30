import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createWriteStream, mkdirSync } from "fs";
import { dirname } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { s3Client } from "./client";

export async function downloadS3Object(params: {
  bucket: string;
  key: string;
  localPath: string;
}) {
  mkdirSync(dirname(params.localPath), { recursive: true });

  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    })
  );

  if (!result.Body) {
    throw new Error(`S3 object body is empty: ${params.key}`);
  }

  await pipeline(result.Body as Readable, createWriteStream(params.localPath));

  return params.localPath;
}