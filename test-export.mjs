#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import prisma instance from lib/db.ts
const { prisma } = await import(join(__dirname, 'lib/db.js'));

async function testExport() {
  console.log('=== Test Export Functionality ===\n');

  try {
    console.log('1. Testing database connection...');
    const statementCount = await prisma.statementFile.count();
    console.log(`   ✓ Connected! Total statement files: ${statementCount}`);

    console.log('\n2. Checking statement files by status...');
    const syncedCount = await prisma.statementFile.count({
      where: { syncStatus: 'synced' }
    });
    console.log(`   ✓ Synced files: ${syncedCount}`);

    console.log('\n3. Listing recent statement files...');
    const recentFiles = await prisma.statementFile.findMany({
      where: { syncStatus: 'synced' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        serverName: true,
        periodYear: true,
        periodMonth: true,
        s3Key: true,
        localPath: true,
        createdAt: true
      }
    });

    console.log('   Recent files:');
    for (const file of recentFiles) {
      const exists = file.localPath ? existsSync(file.localPath) : false;
      console.log(`     - ${file.serverName} ${file.periodYear}/${file.periodMonth}`);
      console.log(`       S3 Key: ${file.s3Key}`);
      console.log(`       Local path: ${file.localPath || 'N/A'}`);
      console.log(`       File exists: ${exists ? '✓' : '✗'}\n`);
    }

    console.log('\n4. Checking export jobs...');
    const exportJobs = await prisma.exportJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        periodYear: true,
        periodMonth: true,
        totalAccounts: true,
        foundAccounts: true,
        missingAccounts: true,
        errorMessage: true,
        createdAt: true
      }
    });

    console.log('   Recent export jobs:');
    for (const job of exportJobs) {
      console.log(`     - ID: ${job.id}`);
      console.log(`       Status: ${job.status}`);
      console.log(`       Period: ${job.periodYear}/${job.periodMonth}`);
      console.log(`       Accounts: ${job.foundAccounts}/${job.totalAccounts} found, ${job.missingAccounts} missing`);
      if (job.errorMessage) {
        console.log(`       Error: ${job.errorMessage}`);
      }
      console.log('');
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testExport();
