import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LintRunService } from '../services/lint-run.service.js';
import type { ILintRunRepository, LintRunRow, FindingRow } from '../repositories/lint-run.repository.js';
import type { LintQueue } from '../queues/lint-queue.js';

const makeMockRun = (overrides: Partial<LintRunRow> = {}): LintRunRow => ({
  id: 'run-1',
  assetId: null,
  organizationId: 'org-1',
  userId: 'user-1',
  filename: 'test.srt',
  format: 'SRT',
  presetId: 'default',
  engineVersion: '1.0.0',
  status: 'QUEUED',
  summary: { pass: 0, warn: 0, error: 0, total: 0 },
  cues: [],
  exportContent: null,
  createdAt: new Date(),
  finishedAt: null,
  ...overrides,
});

const makeMockRepo = (): ILintRunRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findFindingsByRunId: vi.fn(),
  delete: vi.fn(),
});

const makeMockQueue = (): LintQueue => ({
  addLintJob: vi.fn().mockResolvedValue({}),
  getQueueStats: vi.fn(),
} as unknown as LintQueue);

describe('LintRunService', () => {
  let repo: ILintRunRepository;
  let queue: LintQueue;
  let service: LintRunService;

  beforeEach(() => {
    repo = makeMockRepo();
    queue = makeMockQueue();
    service = new LintRunService(repo, queue);
  });

  describe('create', () => {
    it('persists the run then enqueues a job', async () => {
      const run = makeMockRun();
      vi.mocked(repo.create).mockResolvedValue(run);

      const result = await service.create({
        organizationId: 'org-1',
        userId: 'user-1',
        filename: 'test.srt',
        format: 'SRT',
        presetId: 'default',
        engineVersion: '1.0.0',
        cues: [],
        vocabularyTerms: ['CaptionLint'],
      });

      expect(repo.create).toHaveBeenCalledOnce();
      expect(queue.addLintJob).toHaveBeenCalledWith(expect.objectContaining({ runId: run.id }));
      expect(result.id).toBe(run.id);
    });

    it('passes vocabularyTerms to the queue job', async () => {
      vi.mocked(repo.create).mockResolvedValue(makeMockRun());

      await service.create({
        organizationId: 'org-1',
        userId: 'user-1',
        filename: 'test.srt',
        format: 'SRT',
        presetId: 'tiktok',
        engineVersion: '1.0.0',
        cues: [],
        vocabularyTerms: ['YouTube', 'TikTok'],
      });

      expect(queue.addLintJob).toHaveBeenCalledWith(
        expect.objectContaining({ vocabularyTerms: ['YouTube', 'TikTok'] }),
      );
    });

    it('defaults vocabularyTerms to [] when omitted', async () => {
      vi.mocked(repo.create).mockResolvedValue(makeMockRun());

      await service.create({
        organizationId: 'org-1',
        userId: 'user-1',
        filename: 'test.srt',
        format: 'SRT',
        presetId: 'default',
        engineVersion: '1.0.0',
        cues: [],
      });

      expect(queue.addLintJob).toHaveBeenCalledWith(
        expect.objectContaining({ vocabularyTerms: [] }),
      );
    });
  });

  describe('list', () => {
    it('returns runs for the given organization', async () => {
      const runs = [makeMockRun(), makeMockRun({ id: 'run-2' })];
      vi.mocked(repo.findByOrganization).mockResolvedValue(runs);

      const result = await service.list('org-1', 50);
      expect(result).toHaveLength(2);
      expect(repo.findByOrganization).toHaveBeenCalledWith('org-1', 50);
    });
  });

  describe('getById', () => {
    it('returns ok with the run when found', async () => {
      const run = makeMockRun();
      vi.mocked(repo.findById).mockResolvedValue(run);

      const result = await service.getById('run-1');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.id).toBe('run-1');
    });

    it('returns not_found when the run does not exist', async () => {
      vi.mocked(repo.findById).mockResolvedValue(undefined);

      const result = await service.getById('missing');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('not_found');
    });
  });

  describe('getFindings', () => {
    it('returns not_found when the run does not exist', async () => {
      vi.mocked(repo.findById).mockResolvedValue(undefined);

      const result = await service.getFindings('missing');
      expect(result.ok).toBe(false);
    });

    it('returns findings when the run exists', async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeMockRun());
      const mockFindings: FindingRow[] = [];
      vi.mocked(repo.findFindingsByRunId).mockResolvedValue(mockFindings);

      const result = await service.getFindings('run-1');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual(mockFindings);
    });
  });

  describe('delete', () => {
    it('delegates deletion to the repository', async () => {
      vi.mocked(repo.delete).mockResolvedValue();

      await service.delete('run-1');
      expect(repo.delete).toHaveBeenCalledWith('run-1');
    });
  });
});
