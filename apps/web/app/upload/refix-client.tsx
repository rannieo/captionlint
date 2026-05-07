"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultVocabularyTerms } from "@repo/config";
import type { PresetId } from "@repo/shared-types";
import { createLintRunFromContent, toStoredHistoryRun } from "@/lib/workflow-data";
import { prependHistoryRun, readHistoryRuns, readVocabularyTerms, writeCurrentRun } from "@/lib/workflow-storage";

const presets: Array<{ label: string; value: PresetId }> = [
  { label: "Default", value: "default" },
  { label: "TikTok", value: "tiktok" },
  { label: "Instagram", value: "instagram" },
  { label: "YouTube Shorts", value: "youtube-shorts" },
];

type ReFicClientProps = {
  runId: string;
  initialPreset: PresetId;
};

export function ReFicClient({ runId, initialPreset }: ReFicClientProps) {
  const router = useRouter();
  const [presetId, setPresetId] = useState<PresetId>(initialPreset);
  const [status, setStatus] = useState("Looking up previous run...");
  const [error, setError] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [storedRun, setStoredRun] = useState<{ id: string; file: string; rawContent: string } | null>(null);
  const [isDemoRun, setIsDemoRun] = useState(false);

  useEffect(() => {
    const runs = readHistoryRuns();
    const found = runs.find((r) => r.id === runId);
    if (!found) {
      setError("This run is no longer available. Please upload the file again.");
      setStatus("Run not found in local history.");
      return;
    }
    if (!found.rawContent) {
      setIsDemoRun(true);
      setStatus("Demo runs can't be re-fixed — upload the actual file instead.");
      return;
    }
    setStoredRun({ id: found.id, file: found.file, rawContent: found.rawContent });
    setStatus(`Ready to re-fix ${found.file} with a different preset.`);
  }, [runId]);

  const selectedPresetLabel = useMemo(
    () => presets.find((p) => p.value === presetId)?.label ?? "Default",
    [presetId],
  );

  async function runRefix() {
    if (!storedRun) return;
    setIsRunning(true);
    setError(undefined);
    setStatus("Re-running lint checks...");

    try {
      const vocabularyTerms = readVocabularyTerms() ?? defaultVocabularyTerms;
      const result = createLintRunFromContent({
        filename: storedRun.file,
        content: storedRun.rawContent,
        presetId,
        vocabularyTerms,
      });

      if (!result.run || !result.exportContent) {
        setError(result.error ?? "Unable to re-run lint on this file.");
        setStatus("Re-fix stopped.");
        return;
      }

      writeCurrentRun({ run: result.run, exportContent: result.exportContent });
      prependHistoryRun(toStoredHistoryRun(result.run, result.exportContent, storedRun.rawContent));
      setStatus("Re-fix complete. Opening results...");
      router.push("/results");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="border-[#1F2937] bg-[#111827]">
      <CardHeader>
        <CardTitle>Re-fix Caption File</CardTitle>
        <CardDescription className="text-zinc-400">
          Apply a different platform preset to a previous lint run without re-uploading.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded border border-[#1F2937] bg-[#0B0F14] px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Source File</p>
          <p className="font-mono text-sm text-zinc-100">{storedRun?.file ?? "—"}</p>
        </div>

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

        <div className="rounded border border-[#1F2937] bg-[#0B0F14] px-3 py-2 text-sm text-zinc-400">
          {status}
        </div>
        {error && (
          <div className="rounded border border-[#7f1d1d] bg-[#450a0a] px-3 py-2 text-sm text-[#fecaca]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {isDemoRun ? (
            <Link href="/upload" className="text-sm text-[#22C55E] hover:text-[#4BE277]">
              Upload file instead
            </Link>
          ) : null}
          <Button
            type="button"
            className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]"
            onClick={runRefix}
            disabled={isRunning || !storedRun || isDemoRun}
          >
            {isRunning ? "Running QA..." : "Run QA"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
