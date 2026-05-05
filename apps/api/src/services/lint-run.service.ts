import type { ILintRunRepository, CreateLintRunInput, LintRunRow, FindingRow } from '../repositories/lint-run.repository.js';
import type { LintQueue } from '../queues/lint-queue.js';

export type CreateRunParams = CreateLintRunInput & {
  vocabularyTerms?: string[];
};

export type LintRunNotFoundError = { kind: 'not_found' };
export type LintRunResult<T> = { ok: true; value: T } | { ok: false; error: LintRunNotFoundError };

export class LintRunService {
  constructor(
    private readonly repo: ILintRunRepository,
    private readonly queue: LintQueue,
  ) {}

  async create(params: CreateRunParams): Promise<LintRunRow> {
    const run = await this.repo.create(params);

    await this.queue.addLintJob({
      runId: run.id,
      content: params.cues.map((c) => c.lines.join('\n')).join('\n\n'),
      filename: params.filename,
      presetId: params.presetId,
      vocabularyTerms: params.vocabularyTerms ?? [],
      format: params.format,
      engineVersion: params.engineVersion,
    });

    return run;
  }

  async list(organizationId: string, limit: number): Promise<LintRunRow[]> {
    return this.repo.findByOrganization(organizationId, limit);
  }

  async getById(id: string): Promise<LintRunResult<LintRunRow>> {
    const run = await this.repo.findById(id);
    if (!run) return { ok: false, error: { kind: 'not_found' } };
    return { ok: true, value: run };
  }

  async getFindings(runId: string): Promise<LintRunResult<FindingRow[]>> {
    const run = await this.repo.findById(runId);
    if (!run) return { ok: false, error: { kind: 'not_found' } };

    const found = await this.repo.findFindingsByRunId(runId);
    return { ok: true, value: found };
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
