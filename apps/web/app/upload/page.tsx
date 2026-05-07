import type { Metadata } from "next";
import type { PresetId } from "@repo/shared-types";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { UploadClient } from "./upload-client";

export const metadata: Metadata = {
  title: "CaptionLint | Upload",
  description: "Upload SRT or VTT files, choose a preset, and run deterministic caption QA.",
};

type UploadPageProps = {
  searchParams: Promise<{
    source?: string;
    preset?: string;
  }>;
};

const presetFromLabel: Record<string, PresetId> = {
  Default: "default",
  TikTok: "tiktok",
  Instagram: "instagram",
  "YouTube Shorts": "youtube-shorts",
};

const presetValues = new Set<PresetId>(["default", "tiktok", "instagram", "youtube-shorts"]);

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const { source, preset } = await searchParams;
  let normalizedPresetValue: PresetId = "default";
  if (preset && presetValues.has(preset as PresetId)) {
    normalizedPresetValue = preset as PresetId;
  } else if (preset && preset in presetFromLabel) {
    normalizedPresetValue = presetFromLabel[preset] ?? "default";
  }

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="font-mono text-sm font-semibold text-zinc-100">New Lint Run</span>}
        showShare={false}
        showExport={false}
      />

      <main className="min-h-screen bg-[#0B0F14] px-4 pb-12 pt-20 md:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">Upload Captions</h1>
            <p className="text-sm text-zinc-400">
              Upload an SRT or VTT file, select a platform preset, run checks, and export a cleaner file.
            </p>
            {source ? (
              <p className="mt-2 font-mono text-xs text-zinc-400">
                Re-fix source: <span className="text-zinc-200">{source}</span>
              </p>
            ) : null}
          </div>
          <UploadClient source={source} initialPreset={normalizedPresetValue} />
        </div>
      </main>
    </WorkspaceShell>
  );
}
