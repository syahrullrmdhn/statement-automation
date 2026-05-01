/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");
const { startWorker } = require("./lib/queue");

console.log("[Worker] Starting queue workers...");
startWorker();
console.log("[Worker] Running. Waiting for jobs...");

// Keep alive
process.on("SIGTERM", () => {
  console.log("[Worker] Shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Worker] Shutting down...");
  process.exit(0);
});
