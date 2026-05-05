import type { IVocabularyRepository, VocabTermRow } from '../repositories/vocabulary.repository.js';

export class VocabularyService {
  constructor(private readonly repo: IVocabularyRepository) {}

  async list(organizationId: string): Promise<VocabTermRow[]> {
    return this.repo.findByOrganization(organizationId);
  }

  async add(organizationId: string, term: string, caseSensitive: boolean): Promise<VocabTermRow> {
    return this.repo.create(organizationId, term.trim(), caseSensitive);
  }

  async remove(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
