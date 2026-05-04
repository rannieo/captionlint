import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@repo/database/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/captionlint';

// Connection pool for runtime
const pool = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 2,
});

export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });
export type Pool = typeof pool;
