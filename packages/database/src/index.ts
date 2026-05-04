import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/captionlint';

// For migrations (single connection)
export const migrationClient = postgres(connectionString, { max: 1 });

// For runtime (connection pool)
const pool = postgres(connectionString, {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });
