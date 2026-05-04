"use client";

import type { LintRun } from "@repo/shared-types";
import { workflowStorageKeys, type StoredHistoryRun } from "./workflow-data";

export type StoredCurrentRun = {
  run: LintRun;
  exportContent: string;
};

export function readCurrentRun(): StoredCurrentRun | undefined {
  return readJson<StoredCurrentRun>(workflowStorageKeys.currentRun);
}

export function writeCurrentRun(value: StoredCurrentRun): void {
  writeJson(workflowStorageKeys.currentRun, value);
}

export function readHistoryRuns(): StoredHistoryRun[] {
  return readJson<StoredHistoryRun[]>(workflowStorageKeys.historyRuns) ?? [];
}

export function prependHistoryRun(run: StoredHistoryRun): void {
  const existing = readHistoryRuns().filter((item) => item.id !== run.id);
  writeJson(workflowStorageKeys.historyRuns, [run, ...existing].slice(0, 25));
}

export function readVocabularyTerms(): string[] | undefined {
  return readJson<string[]>(workflowStorageKeys.vocabularyTerms);
}

export function writeVocabularyTerms(terms: string[]): void {
  writeJson(workflowStorageKeys.vocabularyTerms, terms);
}

function readJson<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
