import { pgTable, varchar, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { workspaces } from './users.js';

export const vocabularyTerms = pgTable('vocabulary_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  term: varchar('term', { length: 255 }).notNull(),
  caseSensitive: boolean('case_sensitive').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceTermIdx: index('vocabulary_workspace_term_idx').on(table.workspaceId, table.term),
}));
