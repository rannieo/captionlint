import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VocabularyService } from '../services/vocabulary.service.js';
import type { IVocabularyRepository, VocabTermRow } from '../repositories/vocabulary.repository.js';

const makeMockTerm = (overrides: Partial<VocabTermRow> = {}): VocabTermRow => ({
  id: 'term-1',
  organizationId: 'org-1',
  term: 'CaptionLint',
  caseSensitive: false,
  createdAt: new Date(),
  ...overrides,
});

const makeMockRepo = (): IVocabularyRepository => ({
  findByOrganization: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
});

describe('VocabularyService', () => {
  let repo: IVocabularyRepository;
  let service: VocabularyService;

  beforeEach(() => {
    repo = makeMockRepo();
    service = new VocabularyService(repo);
  });

  describe('list', () => {
    it('returns all terms for the organization', async () => {
      const terms = [makeMockTerm(), makeMockTerm({ id: 'term-2', term: 'YouTube' })];
      vi.mocked(repo.findByOrganization).mockResolvedValue(terms);

      const result = await service.list('org-1');
      expect(result).toHaveLength(2);
      expect(repo.findByOrganization).toHaveBeenCalledWith('org-1');
    });
  });

  describe('add', () => {
    it('trims whitespace before persisting', async () => {
      const term = makeMockTerm({ term: 'CaptionLint' });
      vi.mocked(repo.create).mockResolvedValue(term);

      await service.add('org-1', '  CaptionLint  ', false);
      expect(repo.create).toHaveBeenCalledWith('org-1', 'CaptionLint', false);
    });

    it('forwards caseSensitive flag to the repository', async () => {
      vi.mocked(repo.create).mockResolvedValue(makeMockTerm({ caseSensitive: true }));

      await service.add('org-1', 'YouTube', true);
      expect(repo.create).toHaveBeenCalledWith('org-1', 'YouTube', true);
    });
  });

  describe('remove', () => {
    it('delegates to the repository', async () => {
      vi.mocked(repo.delete).mockResolvedValue();

      await service.remove('term-1');
      expect(repo.delete).toHaveBeenCalledWith('term-1');
    });
  });
});
