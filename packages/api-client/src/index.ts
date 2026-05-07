import type { LintRun, LintFinding, LintRunStatus, VocabularyTerm } from '@repo/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Lint Runs ──────────────────────────────────────────────────────────────

export type CreateLintRunPayload = {
  filename: string;
  format: 'SRT' | 'VTT';
  presetId: string;
  engineVersion: string;
  organizationId: string;
  cues: Array<{
    index: number;
    startMs: number;
    endMs: number;
    text: string;
    lines: string[];
  }>;
  vocabularyTerms?: string[];
};

export type CreateLintRunResponse = {
  id: string;
  status: LintRunStatus;
};

export type ListLintRunsResponse = {
  runs: LintRun[];
};

export type GetFindingsResponse = {
  findings: LintFinding[];
};

export async function createLintRun(payload: CreateLintRunPayload): Promise<CreateLintRunResponse> {
  const res = await fetch(`${API_BASE}/lint-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create lint run: ${await res.text()}`);
  return res.json();
}

export async function getLintRun(id: string): Promise<LintRun> {
  const res = await fetch(`${API_BASE}/lint-runs/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to get lint run: ${await res.text()}`);
  return res.json();
}

export async function listLintRuns(organizationId?: string, limit?: number): Promise<LintRun[]> {
  const params = new URLSearchParams();
  if (organizationId) params.set('organizationId', organizationId);
  if (limit) params.set('limit', limit.toString());
  const res = await fetch(`${API_BASE}/lint-runs?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to list lint runs: ${await res.text()}`);
  const data: ListLintRunsResponse = await res.json();
  return data.runs;
}

export async function getLintRunFindings(runId: string): Promise<LintFinding[]> {
  const res = await fetch(`${API_BASE}/lint-runs/${runId}/findings`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to get findings: ${await res.text()}`);
  const data: GetFindingsResponse = await res.json();
  return data.findings;
}

export async function exportLintRun(runId: string, format?: 'SRT' | 'VTT'): Promise<{ content: string; format: string; filename: string }> {
  const params = format ? `?format=${format}` : '';
  const res = await fetch(`${API_BASE}/lint-runs/${runId}/export${params}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to export lint run: ${await res.text()}`);
  return res.json();
}

export async function deleteLintRun(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/lint-runs/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to delete lint run: ${await res.text()}`);
}

export async function pollLintStatus(
  runId: string,
  maxAttempts = 60,
  intervalMs = 500
): Promise<LintRun> {
  for (let i = 0; i < maxAttempts; i++) {
    const run = await getLintRun(runId);
    if (run.status === 'PASSED' || run.status === 'FAILED' || run.status === 'ERROR') return run;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Lint run timed out');
}

// ── Assets ─────────────────────────────────────────────────────────────────

export type CreateAssetPayload = {
  filename: string;
  format: 'SRT' | 'VTT';
  content: string;
  organizationId: string;
  durationMs?: number;
};

export type CreateAssetResponse = {
  id: string;
  filename: string;
  format: string;
};

export async function createAsset(payload: CreateAssetPayload): Promise<CreateAssetResponse> {
  const res = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create asset: ${await res.text()}`);
  return res.json();
}

export async function getAsset(id: string): Promise<Omit<CreateAssetResponse, 'format'> & { format: 'SRT' | 'VTT'; checksum: string; createdAt: string }> {
  const res = await fetch(`${API_BASE}/assets/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to get asset: ${await res.text()}`);
  return res.json();
}

// ── Vocabulary ─────────────────────────────────────────────────────────────

export type ListVocabularyResponse = {
  terms: VocabularyTerm[];
};

export type AddVocabularyPayload = {
  term: string;
  caseSensitive?: boolean;
  organizationId: string;
};

export async function listVocabularyTerms(organizationId?: string): Promise<VocabularyTerm[]> {
  const params = new URLSearchParams();
  if (organizationId) params.set('organizationId', organizationId);
  const res = await fetch(`${API_BASE}/vocabulary?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to list vocabulary: ${await res.text()}`);
  const data: ListVocabularyResponse = await res.json();
  return data.terms;
}

export async function addVocabularyTerm(payload: AddVocabularyPayload): Promise<VocabularyTerm> {
  const res = await fetch(`${API_BASE}/vocabulary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to add vocabulary term: ${await res.text()}`);
  return res.json();
}

export async function deleteVocabularyTerm(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/vocabulary/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to delete vocabulary term: ${await res.text()}`);
}

// ── History ────────────────────────────────────────────────────────────────

export type HistoryItem = {
  id: string;
  organizationId: string;
  assetId?: string;
  lintRunId: string;
  exportId?: string;
  filename: string;
  preset: string;
  summary: { pass: number; warn: number; error: number; total: number };
  createdAt: string;
};

export async function listHistory(
  organizationId: string,
  filters?: { filename?: string; preset?: string; limit?: number }
): Promise<HistoryItem[]> {
  const params = new URLSearchParams({ organizationId });
  if (filters?.filename) params.set('filename', filters.filename);
  if (filters?.preset) params.set('preset', filters.preset);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  const res = await fetch(`${API_BASE}/history?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to list history: ${await res.text()}`);
  const data = await res.json();
  return data.items;
}

export async function refixHistory(historyItemId: string, presetId: string): Promise<{ runId: string }> {
  const res = await fetch(`${API_BASE}/history/${historyItemId}/refix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ presetId }),
  });
  if (!res.ok) throw new Error(`Failed to refix history item: ${await res.text()}`);
  return res.json();
}

// ── Rulesets ───────────────────────────────────────────────────────────────

export type RulesetItem = {
  id: string;
  label: string;
  description: string;
  maxCharactersPerLine: number;
  maxLinesPerCue: number;
  maxCharactersPerSecond: number;
  minCueDurationMs: number;
  maxCueDurationMs: number;
};

export async function listRulesets(): Promise<RulesetItem[]> {
  const res = await fetch(`${API_BASE}/rulesets`);
  if (!res.ok) throw new Error(`Failed to list rulesets: ${await res.text()}`);
  const data = await res.json();
  return data.rulesets;
}

export async function getRuleset(id: string): Promise<RulesetItem> {
  const res = await fetch(`${API_BASE}/rulesets/${id}`);
  if (!res.ok) throw new Error(`Failed to get ruleset: ${await res.text()}`);
  return res.json();
}

// ── Health ─────────────────────────────────────────────────────────────────

export async function checkApiHealth(): Promise<{ status: string; timestamp: string; uptime: number }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('API health check failed');
  return res.json();
}
