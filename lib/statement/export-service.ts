import AdmZip from "adm-zip";
import { mkdirSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/db";
import { buildStatementFileName } from "./patterns";

type ExportParams = {
  title: string;
  year: string;
  month: string;
  server?: string;
  accounts: string[];
  createdBy?: string;
};

export async function exportStatement(params: ExportParams) {
  const storagePath = process.env.APP_STORAGE_PATH || "./storage";

  const exportJob = await prisma.exportJob.create({
    data: {
      title: params.title,
      periodYear: params.year,
      periodMonth: params.month,
      serverFilter: params.server,
      status: "processing",
      totalAccounts: params.accounts.length,
      createdBy: params.createdBy,
    },
  });

  try {
    const zipFiles = await prisma.statementFile.findMany({
      where: {
        periodYear: params.year,
        periodMonth: params.month,
        ...(params.server ? { serverName: params.server } : {}),
        syncStatus: "synced",
      },
      orderBy: { createdAt: "desc" },
    });

    const timestamp = new Date()
      .toISOString()
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace("T", "_")
      .slice(0, 15);

    const outputDir = join(storagePath, "exports");
    mkdirSync(outputDir, { recursive: true });

    const safeTitle = params.title.replace(/[^a-zA-Z0-9_-]/g, "_");
    const finalZipPath = join(
      outputDir,
      `${safeTitle}_${params.year}${params.month}_${timestamp}.zip`
    );

    const finalZip = new AdmZip();
    let foundAccounts = 0;
    const missingAccounts: string[] = [];

    for (const rawAccount of params.accounts) {
      const account = rawAccount.trim();
      if (!account) continue;

      const targetFileName = buildStatementFileName(account);
      let found = false;

      for (const statementZip of zipFiles) {
        if (!statementZip.localPath) continue;

        const zip = new AdmZip(statementZip.localPath);
        const entry = zip
          .getEntries()
          .find((item) => item.entryName.endsWith(targetFileName));

        if (!entry) continue;

        const content = entry.getData();
        const renamedFile = `${account}_${params.year}${params.month}_${timestamp}.htm`;
        const pathInsideFinalZip = `${account}/${renamedFile}`;

        finalZip.addFile(pathInsideFinalZip, content);

        await prisma.exportJobAccount.create({
          data: {
            exportJobId: exportJob.id,
            account,
            status: "found",
            filePath: pathInsideFinalZip,
          },
        });

        found = true;
        foundAccounts++;
        break;
      }

      if (!found) {
        missingAccounts.push(account);

        await prisma.exportJobAccount.create({
          data: {
            exportJobId: exportJob.id,
            account,
            status: "missing",
            message: "Statement not found",
          },
        });
      }
    }

    if (missingAccounts.length > 0) {
      const missingCsv = [
        "account,status,message",
        ...missingAccounts.map(
          (account) => `${account},missing,Statement not found`
        ),
      ].join("\n");

      finalZip.addFile("missing_accounts.csv", Buffer.from(missingCsv));
    }

    finalZip.writeZip(finalZipPath);

    const status = missingAccounts.length > 0 ? "partial" : "completed";

    await prisma.exportJob.update({
      where: { id: exportJob.id },
      data: {
        status,
        foundAccounts,
        missingAccounts: missingAccounts.length,
        outputZipPath: finalZipPath,
        finishedAt: new Date(),
      },
    });

    return {
      exportJobId: exportJob.id.toString(),
      status,
      foundAccounts,
      missingAccounts: missingAccounts.length,
      downloadUrl: `/api/statement/export/${exportJob.id}/download`,
    };
  } catch (error) {
    await prisma.exportJob.update({
      where: { id: exportJob.id },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        finishedAt: new Date(),
      },
    });

    throw error;
  }
}