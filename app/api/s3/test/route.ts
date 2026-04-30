import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3/client";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const bucket = process.env.S3_BUCKET!;
  const prefix = process.env.S3_STATEMENT_PREFIX || "";

  try {
    const result = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 10,
      })
    );

    return NextResponse.json({
      bucket,
      prefix,
      count: result.Contents?.length || 0,
      files:
        result.Contents?.map((item) => ({
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
        })) || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to connect to S3",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}