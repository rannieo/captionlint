import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { HistoryService } from '../services/history.service.js';
import { DrizzleHistoryRepository } from '../repositories/history.repository.js';
import { DrizzleAssetRepository } from '../repositories/asset.repository.js';
import { DrizzleLintRunRepository } from '../repositories/lint-run.repository.js';
import { LintQueue } from '../queues/lint-queue.js';
import { requireAuth } from '../plugins/auth-plugin.js';

const refixSchema = z.object({
  presetId: z.string().min(1),
});

export async function historyRoute(fastify: FastifyInstance) {
  const service = new HistoryService(
    new DrizzleHistoryRepository(),
    new DrizzleAssetRepository(),
    new DrizzleLintRunRepository(),
    new LintQueue(),
  );

  fastify.get<{ Querystring: { organizationId?: string; filename?: string; preset?: string; limit?: string } }>(
    '/',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { organizationId = '', filename, preset, limit } = request.query;
      const items = await service.list(organizationId, {
        filename,
        preset,
        limit: limit ? Math.min(parseInt(limit, 10), 200) : 50,
      });
      return reply.send({ items });
    },
  );

  fastify.post<{ Params: { id: string } }>(
    '/:id/refix',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const body = refixSchema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.message });

      const result = await service.refix(request.params.id, body.data.presetId, request.session!.user.id);
      if (!result.ok) return reply.status(400).send({ error: result.error });
      return reply.status(201).send({ runId: result.value.runId });
    },
  );
}
