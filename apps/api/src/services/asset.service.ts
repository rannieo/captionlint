import { createHash } from 'crypto';
import type { IAssetRepository, AssetRow, CreateAssetInput } from '../repositories/asset.repository.js';

export type CreateAssetParams = {
  organizationId: string;
  userId: string;
  filename: string;
  format: 'SRT' | 'VTT';
  content: string;
  durationMs?: number;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export class AssetService {
  constructor(private readonly repo: IAssetRepository) {}

  async create(params: CreateAssetParams): Promise<AssetRow> {
    const checksum = createHash('sha256').update(params.content).digest('hex');
    const input: CreateAssetInput = { ...params, checksum };
    return this.repo.create(input);
  }

  async getById(id: string): Promise<Result<Omit<AssetRow, 'content'>>> {
    const row = await this.repo.findById(id);
    if (!row) return { ok: false, error: 'Asset not found' };
    const { content: _content, ...metadata } = row;
    return { ok: true, value: metadata };
  }

  async getContentById(id: string): Promise<Result<{ content: string; format: 'SRT' | 'VTT'; filename: string }>> {
    const row = await this.repo.findById(id);
    if (!row) return { ok: false, error: 'Asset not found' };
    return { ok: true, value: { content: row.content, format: row.format as 'SRT' | 'VTT', filename: row.filename } };
  }
}
