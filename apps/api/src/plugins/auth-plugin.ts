import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { fromNodeHeaders } from 'better-auth/node';
import { auth, type Session } from '../auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session | null;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('session', null);

  fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    request.session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
  });
}

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session?.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};

export const requireOrgMember = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session?.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  const orgId = (request.query as { organizationId?: string }).organizationId
    ?? (request.body as { organizationId?: string } | undefined)?.organizationId;
  if (!orgId) {
    return reply.status(400).send({ error: 'organizationId is required' });
  }
};

export default fp(authPlugin, { name: 'auth' });
