import type { Metadata } from "next";
import type { PresetId } from "@repo/shared-types";
import { WorkspaceShell } from "../../../_components/workspace-shell";
import { WorkspaceTopbar } from "../../../_components/workspace-topbar";
import { ReFicClient } from "../../refix-client";

export const metadata: Metadata = {
  title: "CaptionLint | Re-fix Run",
  description: "Apply a different platform preset to a previous lint run without re-uploading.",
};

type RefixRunPageProps = {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ preset?: string }>;
};

const presetValues = new Set<PresetId>(["default", "tiktok", "instagram", "youtube-shorts"]);

export default async function RefixRunPage({ params, searchParams }: RefixRunPageProps) {
  const { runId } = await params;
  const { preset } = await searchParams;

  const initialPreset: PresetId =
    preset && presetValues.has(preset as PresetId) ? (preset as PresetId) : "default";

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={
          <span className="font-mono text-sm font-semibold text-zinc-100">Re-fix Run</span>
        }
        showShare={false}
        showExport={false}
      />

      <main className="min-h-screen bg-[#0B0F14] px-4 pb-12 pt-20 md:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">Re-fix Captions</h1>
            <p className="text-sm text-zinc-400">
              Apply a different platform preset to a previous lint run without re-uploading.
            </p>
          </div>
          <ReFicClient runId={runId} initialPreset={initialPreset} />
        </div>
      </main>
    </WorkspaceShell>
  );
}
