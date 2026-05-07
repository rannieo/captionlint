import { and, desc, eq, ilike } from 'drizzle-orm';
import { db } from '../db/index.js';
import { historyItems } from '@repo/database/schema';

export type HistoryItemRow = typeof historyItems.$inferSelect;
export type CreateHistoryInput = {
  organizationId: string;
  assetId?: string;
  lintRunId: string;
  exportId?: string;
  filename: string;
  preset: string;
  summary: { pass: number; warn: number; error: number; total: number };
};

export type HistoryFilters = {
  filename?: string;
  preset?: string;
  limit?: number;
};

export interface IHistoryRepository {
  create(input: CreateHistoryInput): Promise<HistoryItemRow>;
  findById(id: string): Promise<HistoryItemRow | undefined>;
  findByOrganization(organizationId: string, filters?: HistoryFilters): Promise<HistoryItemRow[]>;
}

export class DrizzleHistoryRepository implements IHistoryRepository {
  async create(input: CreateHistoryInput): Promise<HistoryItemRow> {
    const [row] = await db.insert(historyItems).values(input).returning();
    return row!;
  }

  async findById(id: string): Promise<HistoryItemRow | undefined> {
    const [row] = await db.select().from(historyItems).where(eq(historyItems.id, id));
    return row;
  }

  async findByOrganization(organizationId: string, filters: HistoryFilters = {}): Promise<HistoryItemRow[]> {
    const { filename, preset, limit = 50 } = filters;
    const conditions = [eq(historyItems.organizationId, organizationId)];
    if (filename) conditions.push(ilike(historyItems.filename, `%${filename}%`));
    if (preset) conditions.push(eq(historyItems.preset, preset));

    return db
      .select()
      .from(historyItems)
      .where(and(...conditions))
      .orderBy(desc(historyItems.createdAt))
      .limit(Math.min(limit, 200));
  }
}
