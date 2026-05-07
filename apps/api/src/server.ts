import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import authPlugin from './plugins/auth-plugin.js';
import { authRoute } from './routes/auth.js';
import { healthRoute } from './routes/health.js';
import { lintRunsRoute } from './routes/lint-runs.js';
import { vocabularyRoute } from './routes/vocabulary.js';
import { assetsRoute } from './routes/assets.js';
import { historyRoute } from './routes/history.js';
import { rulesetsRoute } from './routes/rulesets.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
});

await fastify.register(helmet, { contentSecurityPolicy: false });

await fastify.register(authPlugin);

await fastify.register(authRoute);
await fastify.register(healthRoute);
await fastify.register(lintRunsRoute, { prefix: '/lint-runs' });
await fastify.register(vocabularyRoute, { prefix: '/vocabulary' });
await fastify.register(assetsRoute, { prefix: '/assets' });
await fastify.register(historyRoute, { prefix: '/history' });
await fastify.register(rulesetsRoute, { prefix: '/rulesets' });

const port = parseInt(process.env.PORT ?? process.env.API_PORT ?? '4000', 10);
const host = process.env.API_HOST ?? '0.0.0.0';

try {
  await fastify.listen({ port, host });
  console.log(`API server running on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
