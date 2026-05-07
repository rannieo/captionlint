import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { assets } from '@repo/database/schema';

export type AssetRow = typeof assets.$inferSelect;
export type CreateAssetInput = {
  organizationId: string;
  userId: string;
  filename: string;
  format: 'SRT' | 'VTT';
  content: string;
  checksum: string;
  durationMs?: number;
};

export interface IAssetRepository {
  create(input: CreateAssetInput): Promise<AssetRow>;
  findById(id: string): Promise<AssetRow | undefined>;
  findByOrganization(organizationId: string): Promise<AssetRow[]>;
}

export class DrizzleAssetRepository implements IAssetRepository {
  async create(input: CreateAssetInput): Promise<AssetRow> {
    const [row] = await db.insert(assets).values(input).returning();
    return row!;
  }

  async findById(id: string): Promise<AssetRow | undefined> {
    const [row] = await db.select().from(assets).where(eq(assets.id, id));
    return row;
  }

  async findByOrganization(organizationId: string): Promise<AssetRow[]> {
    return db
      .select()
      .from(assets)
      .where(eq(assets.organizationId, organizationId))
      .orderBy(assets.createdAt);
  }
}
