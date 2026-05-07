"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { defaultVocabularyTerms } from "@repo/config";
import type { PresetId } from "@repo/shared-types";
import { createLintRunFromContent, toStoredHistoryRun } from "@/lib/workflow-data";
import { prependHistoryRun, readVocabularyTerms, writeCurrentRun } from "@/lib/workflow-storage";
import { authClient } from "@/lib/auth-client";
import { createAsset, createLintRun, pollLintStatus } from "@repo/api-client";

const maxFileSizeBytes = 1_000_000;
const LINT_ENGINE_VERSION = "1.0.0";

const presets: Array<{ label: string; value: PresetId }> = [
  { label: "Default", value: "default" },
  { label: "TikTok", value: "tiktok" },
  { label: "Instagram", value: "instagram" },
  { label: "YouTube Shorts", value: "youtube-shorts" },
];

type UploadClientProps = {
  source?: string;
  initialPreset: PresetId;
};

export function UploadClient({ source, initialPreset }: UploadClientProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [orgId, setOrgId] = useState<string | undefined>();
  const [presetId, setPresetId] = useState<PresetId>(initialPreset);
  const [file, setFile] = useState<File | undefined>();
  const [status, setStatus] = useState<string>(source ? "Choose a file to re-fix with the selected preset." : "Choose an SRT or VTT file to begin.");
  const [error, setError] = useState<string>();
  const [parseWarning, setParseWarning] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    authClient.organization.list().then((result) => {
      const orgs = result.data;
      const firstOrg = orgs?.[0];
      if (firstOrg) setOrgId(firstOrg.id);
    }).catch(() => {});
  }, [session?.user]);

  const selectedPresetLabel = useMemo(
    () => presets.find((preset) => preset.value === presetId)?.label ?? "Default",
    [presetId]
  );

  function onFileChange(nextFile: File | undefined) {
    setError(undefined);
    setFile(undefined);

    if (!nextFile) {
      setStatus("Choose an SRT or VTT file to begin.");
      return;
    }

    if (!/\.(srt|vtt)$/i.test(nextFile.name)) {
      setError("Unsupported file type. Upload an .srt or .vtt file.");
      setStatus("Unsupported files do not start lint runs.");
      return;
    }

    if (nextFile.size > maxFileSizeBytes) {
      setError("File is too large for the MVP browser-local run. Keep files under 1 MB.");
      setStatus("Large-file handling will move to background jobs later.");
      return;
    }

    setFile(nextFile);
    setStatus(`${nextFile.name} is ready for ${selectedPresetLabel} QA.`);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    onFileChange(e.dataTransfer.files[0]);
  }

  async function runQaApi(content: string) {
    const format = /\.vtt$/i.test(file!.name) ? "VTT" : "SRT";

    const asset = await createAsset({
      filename: file!.name,
      format,
      content,
      organizationId: orgId!,
    });

    const run = await createLintRun({
      filename: file!.name,
      format,
      presetId,
      engineVersion: LINT_ENGINE_VERSION,
      organizationId: orgId!,
      assetId: asset.id,
      cues: [],
      vocabularyTerms: readVocabularyTerms() ?? defaultVocabularyTerms,
    });

    setStatus("Waiting for lint worker...");
    await pollLintStatus(run.id);
    router.push(`/results/${run.id}`);
    void asset;
  }

  async function runQaLocal(content: string) {
    const vocabularyTerms = readVocabularyTerms() ?? defaultVocabularyTerms;
    const result = createLintRunFromContent({ filename: file!.name, content, presetId, vocabularyTerms });

    if (!result.run || !result.exportContent) {
      setError(result.error ?? "Unable to parse this caption file.");
      setStatus("Lint run stopped before findings were created.");
      return;
    }

    writeCurrentRun({ run: result.run, exportContent: result.exportContent });
    prependHistoryRun(toStoredHistoryRun(result.run, result.exportContent, content));
    if (result.parserWarnings && result.parserWarnings.length > 0) {
      setParseWarning(`${result.parserWarnings.length} cue${result.parserWarnings.length > 1 ? "s" : ""} skipped during parsing (malformed structure). Check findings for details.`);
    }
    setStatus("Lint run complete. Opening results...");
    router.push("/results");
  }

  async function runQa() {
    if (!file) {
      setError("Choose an SRT or VTT file before running QA.");
      return;
    }

    setIsRunning(true);
    setError(undefined);
    setParseWarning(undefined);
    setStatus("Parsing captions and running deterministic checks...");

    try {
      const content = await file.text();

      if (session?.user && orgId) {
        await runQaApi(content);
      } else {
        await runQaLocal(content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error during QA run.");
      setStatus("QA run failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="border-[#1F2937] bg-[#111827]">
      <CardHeader>
        <CardTitle>Caption File</CardTitle>
        <CardDescription className="text-zinc-400">
          Accepted formats: .srt and .vtt · Max 1 MB
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Drop zone */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
            isDragging ? "border-[#22C55E] bg-[#22C55E0f]" : "border-[#1F2937] bg-[#0B0F14]"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Upload icon */}
          <div className={cn("rounded-full p-3 transition-colors", isDragging ? "bg-[#22C55E20]" : "bg-[#1F2937]")}>
            <svg
              className={cn("size-7 transition-colors", isDragging ? "text-[#22C55E]" : "text-zinc-400")}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          {file ? (
            <div className="flex items-center gap-2 rounded-full border border-[#22C55E40] bg-[#22C55E0f] px-4 py-1.5 text-sm text-[#22C55E]">
              <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="max-w-xs truncate font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => onFileChange(undefined)}
                className="ml-1 rounded-full text-[#22C55E] opacity-70 hover:opacity-100"
                aria-label="Remove file"
              >
                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {isDragging ? "Drop to upload" : "Drag & drop your file here"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">or</p>
            </div>
          )}

          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#1F2937] bg-[#111827] px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-[#374151] hover:bg-[#1c2433]"
          >
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            {file ? "Change File" : "Browse Files"}
            <input
              type="file"
              accept=".srt,.vtt"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files?.[0])}
            />
          </label>
        </div>

        {/* Preset + Run Mode selects */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Platform Preset</label>
            <Select value={presetId} onValueChange={(value) => setPresetId(value as PresetId)}>
              <SelectTrigger className="border-[#1F2937] bg-[#0B0F14]">
                <SelectValue placeholder={selectedPresetLabel} />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Run Mode</label>
            <Select value="deterministic">
              <SelectTrigger className="border-[#1F2937] bg-[#0B0F14]">
                <SelectValue placeholder="Deterministic QA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deterministic">Deterministic QA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status / errors */}
        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#7f1d1d] bg-[#450a0a] px-4 py-3 text-sm text-[#fecaca]">
            <svg className="mt-0.5 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        ) : isRunning ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-zinc-400">
            <svg className="size-4 shrink-0 animate-spin text-[#22C55E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {status}
          </div>
        ) : null}

        {parseWarning ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#78350f] bg-[#451a03] px-4 py-3 text-sm text-[#fde68a]">
            <svg className="mt-0.5 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l7.354 12.748zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {parseWarning}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            className="h-10 px-6 bg-[#22C55E] text-[#003915] hover:bg-[#4BE277] disabled:opacity-50"
            onClick={runQa}
            disabled={isRunning || !file}
          >
            {isRunning ? "Running QA..." : "Run QA"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
