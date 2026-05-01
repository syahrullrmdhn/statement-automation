#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('=== Debug Export Statement Function ===\n');

  // Import export function
  console.log('Loading export-service module...');
  const { exportStatement } = await import(join(__dirname, 'lib/statement/export-service.js'));

  console.log('✓ export-service loaded successfully\n');

  // Test with simple parameters
  console.log('Testing export with parameters:');
  const params = {
    title: 'DebugTest',
    year: '2026',
    month: '04',  // April 2026 - data exists
    accounts: ['10001'],
    createdBy: 'debug_test'
  };
  console.log(JSON.stringify(params, null, 2));
  console.log('\nExecuting exportStatement...\n');

  const result = await exportStatement(params);

  console.log('✓ Export completed successfully!');
  console.log('\nResult:');
  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error('\n❌ Error occurred:');
  console.error('Type:', error.constructor.name);
  console.error('Message:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}
