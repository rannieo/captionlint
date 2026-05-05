import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { VocabularyService } from '../services/vocabulary.service.js';
import { DrizzleVocabularyRepository } from '../repositories/vocabulary.repository.js';
import { requireAuth } from '../plugins/auth-plugin.js';

const addTermSchema = z.object({
  term: z.string().min(1),
  caseSensitive: z.boolean().optional().default(false),
  organizationId: z.string(),
});

export async function vocabularyRoute(fastify: FastifyInstance) {
  const service = new VocabularyService(new DrizzleVocabularyRepository());

  fastify.get<{ Querystring: { organizationId?: string } }>(
    '/',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const terms = await service.list(request.query.organizationId ?? '');
      return reply.send({ terms });
    },
  );

  fastify.post(
    '/',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = addTermSchema.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.message });

      const { organizationId, term, caseSensitive } = body.data;
      const created = await service.add(organizationId, term, caseSensitive);
      return reply.status(201).send(created);
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      await service.remove(request.params.id);
      return reply.send({ deleted: true });
    },
  );
}
