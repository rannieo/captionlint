import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { WorkspaceShell } from "../../_components/workspace-shell";
import { WorkspaceTopbar } from "../../_components/workspace-topbar";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Create New Project",
  description: "Configure workspace settings and lint presets for a new project.",
};

const presetCards = [
  {
    name: "YouTube Shorts",
    description: "Compact line length, 2 lines max, and readability-first timing.",
    active: true,
  },
  {
    name: "Default",
    description: "Balanced CaptionLint defaults for SRT/VTT caption QA.",
    active: false,
  },
];

const yamlPreview = `project:
  name: "Acme_Corp_Campaign"
  version: "1.0.0"

workspace:
  source_lang: "en-US"
  target_default: "auto"

linter:
  preset: "youtube-shorts"
  strict_mode: true
  rules:
    max_characters_per_line: 42
    max_lines_per_event: 2
    min_duration_ms: 833
    min_gap_frames: 2
    reading_speed_cps: 20`;

export default function NewProjectPage() {
  if (!featureFlags.showProjects) {
    notFound();
  }

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<h1 className="font-mono text-sm font-semibold text-zinc-100">Create New Project</h1>}
        shareLabel="Cancel"
        exportLabel="Initialize"
      />

      <main className="mt-12 grid h-[calc(100vh-48px)] grid-cols-1 overflow-hidden lg:grid-cols-12">
        <section className="overflow-y-auto bg-[#131314] p-6 lg:col-span-7 xl:col-span-6 lg:p-12">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="border-b border-[#3d4a3d] pb-5">
              <h2 className="mb-1 text-3xl font-semibold tracking-tight">Create New Project</h2>
              <p className="text-sm text-zinc-400">Configure your workspace settings and lint rules.</p>
            </div>

            <Card className="border-[#3d4a3d] bg-[#111112]">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription className="text-zinc-400">
                  Base metadata and language profile for this workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500">Project Name</label>
                  <Input defaultValue="Acme_Corp_Campaign" className="border-[#353436] bg-[#0A0A0B]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500">Client / Workspace</label>
                  <Input placeholder="Optional identifier" className="border-[#353436] bg-[#0A0A0B]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-zinc-500">Source Language</label>
                    <Select>
                      <SelectTrigger className="border-[#353436] bg-[#0A0A0B]">
                        <SelectValue placeholder="English (US)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-us">English (US)</SelectItem>
                        <SelectItem value="en-gb">English (UK)</SelectItem>
                        <SelectItem value="es-es">Spanish (ES)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-zinc-500">Default Target</label>
                    <Select>
                      <SelectTrigger className="border-[#353436] bg-[#0A0A0B]">
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="es-la">Spanish (LA)</SelectItem>
                        <SelectItem value="pt-br">Portuguese (BR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3d4a3d] bg-[#111112]">
              <CardHeader>
                <CardTitle>CaptionLint Preset</CardTitle>
                <CardDescription className="text-zinc-400">
                  Choose a baseline ruleset for structural and linguistic QA.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {presetCards.map((preset) => (
                  <article
                    key={preset.name}
                    className={`rounded-lg border p-4 ${
                      preset.active
                        ? "border-[#22C55E66] bg-[#22C55E0F]"
                        : "border-[#353436] bg-[#0A0A0B]"
                    }`}
                  >
                    <h3 className="mb-1 text-sm font-semibold">{preset.name}</h3>
                    <p className="text-xs text-zinc-400">{preset.description}</p>
                  </article>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" className="border-[#353436] bg-[#111112]">
                Save Draft
              </Button>
              <Button className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Initialize Project</Button>
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-[#3d4a3d] bg-[#0A0A0B] lg:flex lg:col-span-5 xl:col-span-6">
          <div className="flex w-full flex-col">
            <div className="flex h-12 items-center border-b border-[#3d4a3d] px-4">
              <span className="font-mono text-xs text-zinc-500">captionlint.yml</span>
            </div>
            <pre className="flex-1 overflow-auto p-5 font-mono text-xs leading-relaxed text-zinc-300">
              <code>{yamlPreview}</code>
            </pre>
          </div>
        </aside>
      </main>
    </WorkspaceShell>
  );
}
