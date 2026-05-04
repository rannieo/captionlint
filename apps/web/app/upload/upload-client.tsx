"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { prependHistoryRun, readVocabularyTerms, writeCurrentRun } from "@/lib/workflow-storage";

const maxFileSizeBytes = 1_000_000;
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
  const [presetId, setPresetId] = useState<PresetId>(initialPreset);
  const [file, setFile] = useState<File | undefined>();
  const [status, setStatus] = useState<string>(source ? "Choose a file to re-fix with the selected preset." : "Choose an SRT or VTT file to begin.");
  const [error, setError] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);

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

  async function runQa() {
    if (!file) {
      setError("Choose an SRT or VTT file before running QA.");
      return;
    }

    setIsRunning(true);
    setError(undefined);
    setStatus("Parsing captions and running deterministic checks...");

    try {
      const content = await file.text();
      const vocabularyTerms = readVocabularyTerms() ?? defaultVocabularyTerms;
      const result = createLintRunFromContent({ filename: file.name, content, presetId, vocabularyTerms });

      if (!result.run || !result.exportContent) {
        setError(result.error ?? "Unable to parse this caption file.");
        setStatus("Lint run stopped before findings were created.");
        return;
      }

      writeCurrentRun({ run: result.run, exportContent: result.exportContent });
      prependHistoryRun(toStoredHistoryRun(result.run, result.exportContent));
      setStatus("Lint run complete. Opening results...");
      router.push("/results");
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
        <label className="block rounded border border-dashed border-[#1F2937] bg-[#0B0F14] p-8 text-center text-sm text-zinc-400">
          <div className="mb-3 text-zinc-300">Drag and drop your file here, or choose one manually</div>
          <Input
            type="file"
            accept=".srt,.vtt"
            className="mx-auto max-w-xs border-[#1F2937] bg-[#111827]"
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
