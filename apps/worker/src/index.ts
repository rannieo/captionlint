import { LintQueue } from './queues/lint-queue.js';
import { lintProcessor } from './processors/lint-processor.js';

async function main() {
  console.log('Starting CaptionLint worker...');

  const lintQueue = new LintQueue();
  const worker = lintQueue.createWorker(lintProcessor, 5);

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log('Worker started, waiting for jobs...');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
