import type { FastifyInstance } from 'fastify';
import { captionPresets } from '@repo/config';

export async function rulesetsRoute(fastify: FastifyInstance) {
  fastify.get('/', async (_request, reply) => {
    return reply.send({ rulesets: captionPresets });
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const preset = captionPresets.find((p) => p.id === request.params.id);
    if (!preset) return reply.status(404).send({ error: 'Ruleset not found' });
    return reply.send(preset);
  });
}
