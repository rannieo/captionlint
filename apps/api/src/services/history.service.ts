import type { IHistoryRepository, HistoryItemRow, HistoryFilters } from '../repositories/history.repository.js';
import type { IAssetRepository } from '../repositories/asset.repository.js';
import type { ILintRunRepository } from '../repositories/lint-run.repository.js';
import type { LintQueue } from '../queues/lint-queue.js';
import { LINT_ENGINE_VERSION } from '@repo/lint-engine';

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export class HistoryService {
  constructor(
    private readonly historyRepo: IHistoryRepository,
    private readonly assetRepo: IAssetRepository,
    private readonly lintRunRepo: ILintRunRepository,
    private readonly queue: LintQueue,
  ) {}

  async list(organizationId: string, filters?: HistoryFilters): Promise<HistoryItemRow[]> {
    return this.historyRepo.findByOrganization(organizationId, filters);
  }

  async refix(historyItemId: string, newPresetId: string, userId: string): Promise<Result<{ runId: string }>> {
    const item = await this.historyRepo.findById(historyItemId);
    if (!item) return { ok: false, error: 'History item not found' };

    if (!item.assetId) return { ok: false, error: 'This history item has no associated asset — re-upload the file to re-fix' };

    const asset = await this.assetRepo.findById(item.assetId);
    if (!asset) return { ok: false, error: 'Asset not found' };

    const run = await this.lintRunRepo.create({
      assetId: asset.id,
      organizationId: item.organizationId,
      userId,
      filename: asset.filename,
      format: asset.format as 'SRT' | 'VTT',
      presetId: newPresetId,
      engineVersion: LINT_ENGINE_VERSION,
      cues: [],
      summary: { pass: 0, warn: 0, error: 0, total: 0 },
    });

    await this.queue.addLintJob({
      runId: run.id,
      content: asset.content,
      filename: asset.filename,
      presetId: newPresetId,
      vocabularyTerms: [],
      format: asset.format as 'SRT' | 'VTT',
      engineVersion: LINT_ENGINE_VERSION,
    });

    return { ok: true, value: { runId: run.id } };
  }
}
