import type { Metadata } from "next";
import { createDemoLintRun } from "@/lib/workflow-data";
import { WorkspaceShell } from "../_components/workspace-shell";
import { ResultsClient } from "./results-client";

export const metadata: Metadata = {
  title: "CaptionLint | Lint Results",
  description: "Inspect PASS, WARN, and ERROR caption findings with cue-level context.",
};

export default function ResultsPage() {
  const fallback = createDemoLintRun();

  return (
    <WorkspaceShell>
      <ResultsClient fallbackRun={fallback.run} fallbackExportContent={fallback.exportContent} />
    </WorkspaceShell>
  );
}
