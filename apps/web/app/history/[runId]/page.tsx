import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "../../_components/workspace-shell";
import { WorkspaceTopbar } from "../../_components/workspace-topbar";
import { historyRuns } from "@/lib/history-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HistoryEditClient } from "./history-edit-client";

type HistoryRunDetailPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function HistoryRunDetailPage({ params }: HistoryRunDetailPageProps) {
  const { runId } = await params;
  const run = historyRuns.find((item) => item.id === runId);

  if (!run) {
    notFound();
  }

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="text-sm font-semibold text-zinc-100">History Detail</span>}
        showShare={false}
        showExport={false}
      />

      <main className="min-h-screen bg-[#0B0F14] px-4 pb-12 pt-20 md:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">{run.file}</h1>
              <p className="text-sm text-zinc-400">
                Update preset selection for re-fix or return to full history listing.
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/history" />} nativeButton={false}>
              Back to History
            </Button>
          </div>

          <Card className="border-[#1F2937] bg-[#111827]">
            <CardHeader>
              <CardTitle className="text-base">Run Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Date</p>
                  <p className="font-mono text-sm text-zinc-200">{run.date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Auto-fixed</p>
                  <p className="font-mono text-sm text-zinc-200">{run.autoFixed}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Pending</p>
                  <p className="font-mono text-sm text-zinc-200">{run.pendingLabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {run.presets.map((preset) => (
                  <Badge
                    key={preset}
                    variant="outline"
                    className="h-auto rounded border-transparent bg-[#1F2937] px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
                  >
                    {preset}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <HistoryEditClient file={run.file} defaultPreset={run.presets[0] ?? "Default"} />
        </div>
      </main>
    </WorkspaceShell>
  );
}
