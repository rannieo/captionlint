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
      cues: [],
      vocabularyTerms: readVocabularyTerms() ?? defaultVocabularyTerms,
    });

    setStatus("Waiting for lint worker...");
    await pollLintStatus(run.id);
    router.push(`/results?runId=${run.id}`);
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
          Accepted formats: .srt and .vtt. Uploaded caption content stays in this browser for the MVP run.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label
          className={cn(
            "block rounded border border-dashed p-8 text-center text-sm text-zinc-400 transition-colors",
            isDragging ? "border-[#22C55E] bg-[#22C55E0f]" : "border-[#1F2937] bg-[#0B0F14]"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-3 text-zinc-300">Drag and drop your file here, or choose one manually</div>
          <input
            type="file"
            accept=".srt,.vtt"
            className="mx-auto block max-w-xs border border-[#1F2937] bg-[#111827] px-2.5 py-1 text-sm text-zinc-300 file:mr-2 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-200"
            onChange={(event) => onFileChange(event.target.files?.[0])}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500">Platform Preset</label>
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
            <label className="text-xs uppercase tracking-wider text-zinc-500">Run Mode</label>
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

        <div className="rounded border border-[#1F2937] bg-[#0B0F14] px-3 py-2 text-sm text-zinc-400">
          {status}
          {source ? <span className="ml-1 text-zinc-500">Source requested: {source}</span> : null}
        </div>
        {error ? <div className="rounded border border-[#7f1d1d] bg-[#450a0a] px-3 py-2 text-sm text-[#fecaca]">{error}</div> : null}
        {parseWarning ? <div className="rounded border border-[#78350f] bg-[#451a03] px-3 py-2 text-sm text-[#fde68a]">⚠ {parseWarning}</div> : null}

        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]"
            onClick={runQa}
            disabled={isRunning}
          >
            {isRunning ? "Running QA..." : "Run QA"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
