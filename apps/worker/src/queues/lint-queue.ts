import { Queue, Worker, Job, QueueOptions, WorkerOptions } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
});

export type LintJobData = {
  runId: string;
  content: string;
  filename: string;
  presetId: string;
  vocabularyTerms: string[];
  format: 'SRT' | 'VTT';
  engineVersion: string;
};

const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
};

export class LintQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('lint-jobs', queueOptions);
  }

  async addLintJob(data: LintJobData): Promise<Job<LintJobData>> {
    return this.queue.add('lint-captions', data) as Promise<Job<LintJobData>>;
  }

  createWorker(
    processor: (job: Job) => Promise<void>,
    concurrency: number = 5
  ): Worker {
    const workerOptions: WorkerOptions = { connection, concurrency };
    return new Worker('lint-jobs', processor, workerOptions);
  }

  async getQueueStats(): Promise<{ waiting: number; active: number; completed: number; failed: number }> {
    const waiting = await this.queue.getWaitingCount();
    const active = await this.queue.getActiveCount();
    const completed = await this.queue.getCompletedCount();
    const failed = await this.queue.getFailedCount();
    return { waiting, active, completed, failed };
  }
}
