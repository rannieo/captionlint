import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { vocabularyTerms } from '@repo/database/schema';
import { z } from 'zod';

const addTermSchema = z.object({
  term: z.string().min(1),
  caseSensitive: z.boolean().optional().default(false),
  workspaceId: z.string().optional(),
});

export async function vocabularyRoute(fastify: FastifyInstance) {
  // List vocabulary terms
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { workspaceId?: string } }>, reply: FastifyReply) => {
    const workspaceId = request.query.workspaceId;

    const terms = await db.query.vocabularyTerms.findMany({
      where: workspaceId ? eq(vocabularyTerms.workspaceId, workspaceId) : undefined,
      orderBy: [desc(vocabularyTerms.createdAt)],
    });

    return reply.send({ terms });
  });

  // Add vocabulary term
  fastify.post('/', async (request: FastifyRequest<{ Body: z.infer<typeof addTermSchema> }>, reply: FastifyReply) => {
    const validation = addTermSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ error: validation.error.message });
    }

    const { term, caseSensitive = false, workspaceId } = validation.data;

    const [createdTerm] = await db.insert(vocabularyTerms).values({
      workspaceId: workspaceId || '00000000-0000-0000-0000-000000000000', // TODO: from auth
      term,
      caseSensitive,
    }).returning();

    return reply.status(201).send(createdTerm);
  });

  // Delete vocabulary term
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await db.delete(vocabularyTerms).where(eq(vocabularyTerms.id, request.params.id));
    return reply.send({ deleted: true });
  });
}
