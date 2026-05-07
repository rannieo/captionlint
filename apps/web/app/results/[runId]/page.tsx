import type { Metadata } from "next";
import { createDemoLintRun } from "@/lib/workflow-data";
import { WorkspaceShell } from "../../_components/workspace-shell";
import { ResultsClient } from "../results-client";

export const metadata: Metadata = {
  title: "CaptionLint | Lint Results",
  description: "Inspect PASS, WARN, and ERROR caption findings with cue-level context.",
};

type ResultsRunPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function ResultsRunPage({ params }: ResultsRunPageProps) {
  const { runId } = await params;
  const fallback = createDemoLintRun();

  return (
    <WorkspaceShell>
      <ResultsClient
        runId={runId}
        fallbackRun={fallback.run}
        fallbackExportContent={fallback.exportContent}
      />
    </WorkspaceShell>
  );
}
