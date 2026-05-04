import type { LintRun, LintFinding, LintRunStatus, VocabularyTerm } from '@repo/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type CreateLintRunPayload = {
  filename: string;
  format: 'SRT' | 'VTT';
  presetId: string;
  engineVersion: string;
  cues: Array<{
    index: number;
    startMs: number;
    endMs: number;
    text: string;
    lines: string[];
  }>;
  vocabularyTerms?: string[];
  workspaceId?: string;
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

export type ListVocabularyResponse = {
  terms: VocabularyTerm[];
};

export type AddVocabularyPayload = {
  term: string;
  caseSensitive?: boolean;
  workspaceId?: string;
};

/**
 * Create a new lint run (queues job for processing)
 */
export async function createLintRun(payload: CreateLintRunPayload): Promise<CreateLintRunResponse> {
  const res = await fetch(`${API_BASE}/lint-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create lint run: ${error}`);
  }
  return res.json();
}

/**
 * Get a single lint run by ID
 */
export async function getLintRun(id: string): Promise<LintRun> {
  const res = await fetch(`${API_BASE}/lint-runs/${id}`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get lint run: ${error}`);
  }
  return res.json();
}

/**
 * List lint runs for a workspace
 */
export async function listLintRuns(workspaceId?: string, limit?: number): Promise<LintRun[]> {
  const params = new URLSearchParams();
  if (workspaceId) params.set('workspaceId', workspaceId);
  if (limit) params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/lint-runs?${params}`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to list lint runs: ${error}`);
  }
  const data = await res.json();
  return data.runs;
}

/**
 * Get findings for a lint run
 */
export async function getLintRunFindings(runId: string): Promise<LintFinding[]> {
  const res = await fetch(`${API_BASE}/lint-runs/${runId}/findings`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get findings: ${error}`);
  }
  const data = await res.json();
  return data.findings;
}

/**
 * Delete a lint run
 */
export async function deleteLintRun(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/lint-runs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete lint run: ${error}`);
  }
}

/**
 * List vocabulary terms
 */
export async function listVocabularyTerms(workspaceId?: string): Promise<VocabularyTerm[]> {
  const params = new URLSearchParams();
  if (workspaceId) params.set('workspaceId', workspaceId);

  const res = await fetch(`${API_BASE}/vocabulary?${params}`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to list vocabulary: ${error}`);
  }
  const data = await res.json();
  return data.terms;
}

/**
 * Add a vocabulary term
 */
export async function addVocabularyTerm(payload: AddVocabularyPayload): Promise<VocabularyTerm> {
  const res = await fetch(`${API_BASE}/vocabulary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to add vocabulary term: ${error}`);
  }
  return res.json();
}

/**
 * Delete a vocabulary term
 */
export async function deleteVocabularyTerm(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/vocabulary/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete vocabulary term: ${error}`);
  }
}

/**
 * Health check
 */
export async function checkApiHealth(): Promise<{ status: string; timestamp: string; uptime: number }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('API health check failed');
  }
  return res.json();
}

/**
 * Poll for lint run completion
 */
export async function pollLintStatus(
  runId: string,
  maxAttempts: number = 60,
  intervalMs: number = 500
): Promise<LintRun> {
  for (let i = 0; i < maxAttempts; i++) {
    const run = await getLintRun(runId);
    if (run.status === 'PASSED' || run.status === 'FAILED' || run.status === 'ERROR') {
      return run;
    }
    await sleep(intervalMs);
  }
  throw new Error('Lint run timed out');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
