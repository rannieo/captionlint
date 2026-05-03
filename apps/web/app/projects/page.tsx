import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { Button } from "@/components/ui/button";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Projects",
  description: "Organize caption assets by project, client, and platform.",
};

const projects = [
  { name: "Acme Product Launch", assets: 38, activity: "2h ago", status: "Active" },
  { name: "YouTube Shorts Batch", assets: 112, activity: "Yesterday", status: "Active" },
  { name: "Travel Series S02", assets: 24, activity: "3 days ago", status: "Paused" },
  { name: "Course Localization", assets: 61, activity: "1 week ago", status: "Active" },
];

export default function ProjectsPage() {
  if (!featureFlags.showProjects) {
    notFound();
  }

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<div className="font-mono text-sm font-semibold text-zinc-100">Projects</div>}
        rightSlot={
          <Button size="sm" variant="outline" className="h-7 border-[#1F2937] bg-zinc-900">
            Import
          </Button>
        }
        exportLabel="New Project"
      />

      <main className="min-h-screen bg-[#131314] px-6 pb-8 pt-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Projects Portfolio</h1>
              <p className="text-sm text-zinc-400">
                Group captions by client, brand, or campaign and track lint progress per project.
              </p>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#22C55E] px-4 text-sm font-medium text-[#0A0A0B] hover:bg-[#4BE277]"
            >
              Open Creation Flow
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.name}
                className="rounded-lg border border-[#3d4a3d] bg-[#201f20] p-5 transition-colors hover:border-[#22C55E55]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-base font-semibold text-zinc-100">{project.name}</h2>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      project.status === "Active" ? "bg-[#22C55E1a] text-[#22C55E]" : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs text-zinc-400">
                  <p>{project.assets} caption assets</p>
                  <p>Last activity: {project.activity}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 border-[#353436] bg-[#131314]">
                    Open
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-zinc-300 hover:bg-[#2a2a2b]">
                    Archive
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}
