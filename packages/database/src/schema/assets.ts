import { pgTable, uuid, text, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { organization, user } from './auth';

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  format: varchar('format', { enum: ['SRT', 'VTT'] }).notNull(),
  content: text('content').notNull(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('assets_org_idx').on(table.organizationId),
}));
