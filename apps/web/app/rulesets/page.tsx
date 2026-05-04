import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { RulesetsClient } from "./rulesets-client";

export const metadata: Metadata = {
  title: "CaptionLint | Vocabulary Rules",
  description: "Define protected terms used by deterministic caption QA.",
};

export default function RulesetsPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={
          <>
            <span className="text-sm font-semibold text-[#22C55E]">◈ Vocabulary Rules</span>
            <Badge variant="outline" className="h-auto rounded border-[#1F2937] bg-[#1F2937] px-2 py-0.5 font-mono text-xs text-zinc-400">
              MVP Exact Match
            </Badge>
          </>
        }
        showShare={false}
        showExport={false}
      />
      <RulesetsClient />
    </WorkspaceShell>
  );
}
