import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AssetService } from '../services/asset.service.js';
import { DrizzleAssetRepository } from '../repositories/asset.repository.js';
import { requireAuth } from '../plugins/auth-plugin.js';

const createSchema = z.object({
  filename: z.string().min(1),
  format: z.enum(['SRT', 'VTT']),
  content: z.string().min(1),
  organizationId: z.string().min(1),
  durationMs: z.number().int().positive().optional(),
});

export async function assetsRoute(fastify: FastifyInstance) {
  const service = new AssetService(new DrizzleAssetRepository());

  fastify.post('/', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.message });

    const { organizationId, ...rest } = body.data;
    const asset = await service.create({
      ...rest,
      organizationId,
      userId: request.session!.user.id,
    });

    return reply.status(201).send({ id: asset.id, filename: asset.filename, format: asset.format });
  });

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await service.getById(request.params.id);
      if (!result.ok) return reply.status(404).send({ error: result.error });
      return reply.send(result.value);
    },
  );
}
