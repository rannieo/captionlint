import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { LintRunService } from '../services/lint-run.service.js';
import { DrizzleLintRunRepository } from '../repositories/lint-run.repository.js';
import { LintQueue } from '../queues/lint-queue.js';
import { requireAuth } from '../plugins/auth-plugin.js';

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

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      await service.delete(request.params.id);
      return reply.send({ deleted: true });
    },
  );
}
