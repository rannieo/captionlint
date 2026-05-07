import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { lintRuns } from './lint-runs.js';

export const exports = pgTable('exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  lintRunId: uuid('lint_run_id')
    .notNull()
    .references(() => lintRuns.id, { onDelete: 'cascade' }),
  format: varchar('format', { enum: ['SRT', 'VTT', 'JSON'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  runIdx: index('exports_run_idx').on(table.lintRunId),
}));
