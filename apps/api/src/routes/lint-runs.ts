import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { lintRuns, findings } from '@repo/database/schema';
import { LintQueue } from '../queues/lint-queue';
import { z } from 'zod';

const lintQueue = new LintQueue();

const createLintRunSchema = z.object({
  filename: z.string(),
  format: z.enum(['SRT', 'VTT']),
  presetId: z.string(),
  engineVersion: z.string(),
  cues: z.array(z.object({
    index: z.number(),
    startMs: z.number(),
    endMs: z.number(),
    text: z.string(),
    lines: z.array(z.string()),
  })),
  vocabularyTerms: z.array(z.string()).optional(),
  workspaceId: z.string().optional(),
});

export async function lintRunsRoute(fastify: FastifyInstance) {
  // Create lint run (queues job)
  fastify.post('/', async (request: FastifyRequest<{ Body: z.infer<typeof createLintRunSchema> }>, reply: FastifyReply) => {
    const validation = createLintRunSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ error: validation.error.message });
    }

    const { filename, format, presetId, engineVersion, cues, vocabularyTerms = [], workspaceId } = validation.data;

    // Create lint run record
    const [createdRun] = await db.insert(lintRuns).values({
      workspaceId: workspaceId || '00000000-0000-0000-0000-000000000000', // TODO: from auth
      filename,
      format,
      presetId,
      engineVersion,
      status: 'QUEUED',
      summary: { pass: 0, warn: 0, error: 0, total: 0 },
      cues,
    }).returning();

    if (!createdRun) {
      return reply.status(500).send({ error: 'Failed to create lint run' });
    }

    // Queue the job
    await lintQueue.addLintJob({
      runId: createdRun.id,
      content: cues.map(c => c.lines.join('\n')).join('\n\n'), // TODO: store original content
      filename,
      presetId,
      vocabularyTerms,
      format,
      engineVersion,
    });

    return reply.status(201).send({ id: createdRun.id, status: 'QUEUED' });
  });

  // List lint runs
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { workspaceId?: string; limit?: string } }>, reply: FastifyReply) => {
    const workspaceId = request.query.workspaceId;
    const limit = parseInt(request.query.limit || '50');

    const runs = await db.query.lintRuns.findMany({
      where: workspaceId ? eq(lintRuns.workspaceId, workspaceId) : undefined,
      orderBy: [desc(lintRuns.createdAt)],
      limit,
    });

    return reply.send({ runs });
  });

  // Get single lint run
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const run = await db.query.lintRuns.findFirst({
      where: eq(lintRuns.id, request.params.id),
    });

    if (!run) {
      return reply.status(404).send({ error: 'Lint run not found' });
    }

    return reply.send(run);
  });

  // Get findings for a lint run
  fastify.get('/:id/findings', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const run = await db.query.lintRuns.findFirst({
      where: eq(lintRuns.id, request.params.id),
    });

    if (!run) {
      return reply.status(404).send({ error: 'Lint run not found' });
    }

    const runFindings = await db.query.findings.findMany({
      where: eq(findings.lintRunId, request.params.id),
    });

    return reply.send({ findings: runFindings });
  });

  // Delete lint run
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await db.delete(lintRuns).where(eq(lintRuns.id, request.params.id));
    return reply.send({ deleted: true });
  });
}
