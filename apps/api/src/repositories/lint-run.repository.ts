import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { lintRuns, findings } from '@repo/database/schema';

export type CreateLintRunInput = {
  organizationId: string;
  userId: string;
  filename: string;
  format: 'SRT' | 'VTT';
  presetId: string;
  engineVersion: string;
  cues: Array<{ index: number; startMs: number; endMs: number; text: string; lines: string[] }>;
  assetId?: string;
  summary?: { pass: number; warn: number; error: number; total: number };
};

export type LintRunRow = typeof lintRuns.$inferSelect;
export type FindingRow = typeof findings.$inferSelect;

export interface ILintRunRepository {
  create(input: CreateLintRunInput): Promise<LintRunRow>;
  findById(id: string): Promise<LintRunRow | undefined>;
  findByOrganization(organizationId: string, limit: number): Promise<LintRunRow[]>;
  findFindingsByRunId(runId: string): Promise<FindingRow[]>;
  delete(id: string): Promise<void>;
}

export class DrizzleLintRunRepository implements ILintRunRepository {
  async create(input: CreateLintRunInput): Promise<LintRunRow> {
    const [row] = await db
      .insert(lintRuns)
      .values({
        organizationId: input.organizationId,
        userId: input.userId,
        filename: input.filename,
        format: input.format,
        presetId: input.presetId,
        engineVersion: input.engineVersion,
        status: 'QUEUED',
        summary: input.summary ?? { pass: 0, warn: 0, error: 0, total: 0 },
        cues: input.cues,
        assetId: input.assetId,
      })
      .returning();

    if (!row) throw new Error('Failed to create lint run');
    return row;
  }

  async findById(id: string): Promise<LintRunRow | undefined> {
    return db.query.lintRuns.findFirst({ where: eq(lintRuns.id, id) });
  }

  async findByOrganization(organizationId: string, limit: number): Promise<LintRunRow[]> {
    return db.query.lintRuns.findMany({
      where: eq(lintRuns.organizationId, organizationId),
      orderBy: [desc(lintRuns.createdAt)],
      limit,
    });
  }

  async findFindingsByRunId(runId: string): Promise<FindingRow[]> {
    return db.query.findings.findMany({ where: eq(findings.lintRunId, runId) });
  }

  async delete(id: string): Promise<void> {
    await db.delete(lintRuns).where(eq(lintRuns.id, id));
  }
}
