import { Queue, Job, QueueOptions, JobsOptions } from 'bullmq';
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
  organizationId?: string;
  assetId?: string;
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
    const jobOptions: JobsOptions = { removeOnComplete: true };
    return this.queue.add('lint-captions', data, jobOptions) as Promise<Job<LintJobData>>;
  }

  async getQueueStats(): Promise<{ waiting: number; active: number; completed: number; failed: number }> {
    const waiting = await this.queue.getWaitingCount();
    const active = await this.queue.getActiveCount();
    const completed = await this.queue.getCompletedCount();
    const failed = await this.queue.getFailedCount();
    return { waiting, active, completed, failed };
  }
}
