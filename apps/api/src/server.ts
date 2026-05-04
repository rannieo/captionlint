import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { healthRoute } from './routes/health';
import { lintRunsRoute } from './routes/lint-runs';
import { vocabularyRoute } from './routes/vocabulary';

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false, // Disable for API
});

// Register routes
await fastify.register(healthRoute);
await fastify.register(lintRunsRoute, { prefix: '/lint-runs' });
await fastify.register(vocabularyRoute, { prefix: '/vocabulary' });

// Start server
const port = parseInt(process.env.API_PORT || '4000');
const host = process.env.API_HOST || '0.0.0.0';

try {
  await fastify.listen({ port, host });
  console.log(`API server running on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
