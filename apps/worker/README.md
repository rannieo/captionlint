# CaptionLint Worker

BullMQ worker processor for caption lint jobs.

## Prerequisites

- Redis 6+
- PostgreSQL 14+
- Node.js 18+

## Setup

1. Configure environment variables (same as API):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/captionlint
REDIS_URL=redis://localhost:6379
```

2. Start the worker:

```bash
pnpm dev
```

## What It Does

The worker processes lint jobs from the `lint-jobs` queue:

1. Picks up jobs with status `QUEUED`
2. Parses caption content (SRT/VTT)
3. Runs lint engine checks
4. Applies safe fixes
5. Saves findings to database
6. Updates run status to `PASSED`, `ERROR`, or `FAILED`

## Concurrency

Default: 5 concurrent jobs

Adjust via the `concurrency` parameter in `src/index.ts`.

## Monitoring

Watch the console output for job processing:

```
Starting CaptionLint worker...
Worker started, waiting for jobs...
Processing lint job run-abc123 for file test.srt
Lint job run-abc123 completed: 5 pass, 2 warn, 1 error
Job run-abc123 completed successfully
```
