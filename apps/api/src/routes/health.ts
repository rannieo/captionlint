import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function healthRoute(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });
}
