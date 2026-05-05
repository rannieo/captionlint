import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { vocabularyTerms } from '@repo/database/schema';

export type VocabTermRow = typeof vocabularyTerms.$inferSelect;

export interface IVocabularyRepository {
  findByOrganization(organizationId: string): Promise<VocabTermRow[]>;
  create(organizationId: string, term: string, caseSensitive: boolean): Promise<VocabTermRow>;
  delete(id: string): Promise<void>;
}

export class DrizzleVocabularyRepository implements IVocabularyRepository {
  async findByOrganization(organizationId: string): Promise<VocabTermRow[]> {
    return db.query.vocabularyTerms.findMany({
      where: eq(vocabularyTerms.organizationId, organizationId),
      orderBy: [desc(vocabularyTerms.createdAt)],
    });
  }

  async create(organizationId: string, term: string, caseSensitive: boolean): Promise<VocabTermRow> {
    const [row] = await db
      .insert(vocabularyTerms)
      .values({ organizationId, term, caseSensitive })
      .returning();

    if (!row) throw new Error('Failed to create vocabulary term');
    return row;
  }

  async delete(id: string): Promise<void> {
    await db.delete(vocabularyTerms).where(eq(vocabularyTerms.id, id));
  }
}
