import { pgTable, uuid, text, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { organization } from './auth';
import { assets } from './assets';
import { lintRuns } from './lint-runs';
import { exports as exportsTable } from './exports';

export const historyItems = pgTable('history_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id').references(() => assets.id, { onDelete: 'set null' }),
  lintRunId: uuid('lint_run_id')
    .notNull()
    .references(() => lintRuns.id, { onDelete: 'cascade' }),
  exportId: uuid('export_id').references(() => exportsTable.id, { onDelete: 'set null' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  preset: varchar('preset', { length: 50 }).notNull(),
  summary: jsonb('summary')
    .$type<{ pass: number; warn: number; error: number; total: number }>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('history_items_org_idx').on(table.organizationId),
  createdAtIdx: index('history_items_created_at_idx').on(table.createdAt),
}));
