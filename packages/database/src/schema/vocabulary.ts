import { pgTable, varchar, timestamp, uuid, boolean, index, text } from 'drizzle-orm/pg-core';
import { organization } from './auth.js';

export const vocabularyTerms = pgTable('vocabulary_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  term: varchar('term', { length: 255 }).notNull(),
  caseSensitive: boolean('case_sensitive').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgTermIdx: index('vocabulary_org_term_idx').on(table.organizationId, table.term),
}));
