import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { LintRunService } from '../services/lint-run.service.js';
import { DrizzleLintRunRepository } from '../repositories/lint-run.repository.js';
import { LintQueue } from '../queues/lint-queue.js';
import { requireAuth } from '../plugins/auth-plugin.js';
import { db } from '../db/index.js';
import { exports as exportsTable, findings } from '@repo/database/schema';
import { parseCaptionFile, serializeCaptionFile } from '@repo/caption-parser';
import { applySafeFixes } from '@repo/lint-engine';
import type { LintFinding, CaptionCue, SuggestedFix } from '@repo/shared-types';

const createSchema = z.object({
  filename: z.string(),
  format: z.enum(['SRT', 'VTT']),
  presetId: z.string(),
  engineVersion: z.string(),
  organizationId: z.string(),
  cues: z.array(
    z.object({
      index: z.number(),
      startMs: z.number(),
      endMs: z.number(),
      text: z.string(),
      lines: z.array(z.string()),
    }),
  ),
  vocabularyTerms: z.array(z.string()).optional(),
});

export async function lintRunsRoute(fastify: FastifyInstance) {
  const service = new LintRunService(new DrizzleLintRunRepository(), new LintQueue());

  fastify.post('/', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.message });

    const { organizationId, vocabularyTerms, ...rest } = body.data;
    const run = await service.create({
      ...rest,
      organizationId,
      userId: request.session!.user.id,
      vocabularyTerms,
    });

    return reply.status(201).send({ id: run.id, status: run.status });
  });

  fastify.get<{ Querystring: { organizationId?: string; limit?: string } }>(
    '/',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const orgId = request.query.organizationId ?? '';
      const limit = Math.min(parseInt(request.query.limit ?? '50', 10), 200);
      const runs = await service.list(orgId, limit);
      return reply.send({ runs });
    },
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await service.getById(request.params.id);
      if (!result.ok) return reply.status(404).send({ error: 'Lint run not found' });
      return reply.send(result.value);
    },
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id/findings',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await service.getFindings(request.params.id);
      if (!result.ok) return reply.status(404).send({ error: 'Lint run not found' });
      return reply.send({ findings: result.value });
    },
  );

  fastify.post<{ Params: { id: string }; Querystring: { format?: string } }>(
    '/:id/export',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await service.getById(request.params.id);
      if (!result.ok) return reply.status(404).send({ error: 'Lint run not found' });

      const run = result.value;
      if (run.status !== 'PASSED' && run.status !== 'ERROR') {
        return reply.status(409).send({ error: 'Lint run is not yet complete' });
      }

      // If exportContent is already stored on the run, reuse it
      if (run.exportContent) {
        const format = (request.query.format ?? run.format) as 'SRT' | 'VTT';
        const existing = await db
          .select()
          .from(exportsTable)
          .where(eq(exportsTable.lintRunId, run.id))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(exportsTable).values({ lintRunId: run.id, format, content: run.exportContent });
        }

        return reply.send({ content: run.exportContent, format, filename: run.filename });
      }

      // Regenerate from cues + findings (fallback)
      const runFindings = await service.getFindings(run.id);
      if (!runFindings.ok) return reply.status(404).send({ error: 'Findings not found' });

      const cues = (run.cues as CaptionCue[]);
      const lintFindings: LintFinding[] = runFindings.value.map((f) => ({
        id: f.id,
        runId: f.lintRunId,
        ruleCode: f.ruleCode,
        category: f.category as LintFinding['category'],
        severity: f.severity as LintFinding['severity'],
        cueIndex: f.cueIndex ?? undefined,
        startMs: f.startMs ?? undefined,
        endMs: f.endMs ?? undefined,
        message: f.message,
        details: (f.details as Record<string, unknown> | undefined) ?? undefined,
        suggestedFix: f.suggestedFix as SuggestedFix | undefined,
      }));
      const fixedCues = applySafeFixes(cues, lintFindings);
      const format = (request.query.format ?? run.format) as 'SRT' | 'VTT';
      const content = serializeCaptionFile(format, fixedCues);

      await db.insert(exportsTable).values({ lintRunId: run.id, format, content });

      return reply.send({ content, format, filename: run.filename });
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      await service.delete(request.params.id);
      return reply.send({ deleted: true });
    },
  );
}
