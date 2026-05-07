import type { Metadata } from "next";
import Link from "next/link";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "CaptionLint | Dashboard",
  description: "Overview of your recent lint runs and caption QA activity.",
};

export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="text-sm font-semibold text-zinc-100">Dashboard</span>}
        showShare={false}
        showExport={false}
      />

      <div className="min-h-screen bg-[#0B0F14] px-4 pb-16 pt-20 md:px-6">
        <div className="mx-auto w-full max-w-6xl">

          {/* Page header */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Dashboard</h1>
              <p className="text-sm text-zinc-400">Caption QA activity for your workspace.</p>
            </div>
            <Button size="lg" className="shrink-0" render={<Link href="/upload" />} nativeButton={false}>
              New Lint Run <span data-icon="inline-end">→</span>
            </Button>
          </div>

          {/* Dynamic content: KPI cards, chart, recent runs */}
          <DashboardClient />

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border border-[#1F2937] ring-0">
              <CardContent className="p-6">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">↑</div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">New Lint Run</h3>
                <p className="mb-4 text-xs text-zinc-400">Upload an SRT or VTT file and run caption QA checks.</p>
                <Button size="sm" render={<Link href="/upload" />} nativeButton={false}>
                  Upload File
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-[#1F2937] ring-0">
              <CardContent className="p-6">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">⊟</div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">Vocabulary Rules</h3>
                <p className="mb-4 text-xs text-zinc-400">Protect brand names and technical terms from awkward line breaks.</p>
                <Button variant="outline" size="sm" render={<Link href="/rulesets" />} nativeButton={false}>
                  Manage Terms
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-[#1F2937] ring-0">
              <CardContent className="p-6">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">↺</div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">Re-fix from History</h3>
                <p className="mb-4 text-xs text-zinc-400">Apply a different platform preset to a previous caption run.</p>
                <Button variant="outline" size="sm" render={<Link href="/history" />} nativeButton={false}>
                  Open History
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </WorkspaceShell>
  );
}
