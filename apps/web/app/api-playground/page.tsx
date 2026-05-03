import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | API Playground",
  description: "Inspect request and response payloads for CaptionLint API flows.",
};

const requestPayload = `{
  "content": "Hello world, this is a test caption.",
  "ruleset_id": "rs_strict_grammar",
  "language": "en-US",
  "options": {
    "auto_fix": false
  }
}`;

const responsePayload = `{
  "status": "success",
  "data": {
    "lint_results": [
      {
        "type": "grammar",
        "severity": "warning",
        "message": "Missing terminal punctuation.",
        "offset_start": 35,
        "offset_end": 36
      }
    ]
  }
}`;

export default function ApiPlaygroundPage() {
  if (!featureFlags.showApiPlayground) {
    notFound();
  }

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<h1 className="font-mono text-sm font-semibold text-[#22C55E]">video_final.srt</h1>}
      />

      <main className="mt-12 grid h-[calc(100vh-48px)] grid-cols-1 overflow-hidden bg-[#0A0A0B] lg:grid-cols-2">
        <section className="flex flex-col border-r border-[#1E293B] bg-[#111112]">
          <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
            <h2 className="text-lg font-semibold">Request</h2>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#3d4a3d] bg-[#0A0A0B]">
                POST
              </Button>
              <Input
                readOnly
                defaultValue="https://api.captionlint.com/v1/lint"
                className="border-[#3d4a3d] bg-[#0A0A0B] font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500">Authorization</label>
              <Input placeholder="Bearer sk_live_..." className="border-[#3d4a3d] bg-[#0A0A0B] font-mono" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-zinc-500">Body (JSON)</label>
                <button type="button" className="text-xs text-[#22C55E]">
                  Format
                </button>
              </div>
              <textarea
                defaultValue={requestPayload}
                className="min-h-[280px] flex-1 resize-none rounded border border-[#3d4a3d] bg-[#0A0A0B] p-3 font-mono text-xs text-zinc-300 focus:border-[#22C55E] focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col bg-[#111112]">
          <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
            <h2 className="text-lg font-semibold">Response</h2>
            <Button className="h-8 bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Send Request</Button>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="mb-3 flex items-center gap-4 font-mono text-xs text-zinc-500">
              <span className="text-[#22C55E]">200 OK</span>
              <span>142 ms</span>
              <span>1.2 KB</span>
            </div>
            <pre className="min-h-[320px] flex-1 overflow-auto rounded border border-[#3d4a3d] bg-[#0A0A0B] p-3 font-mono text-xs text-zinc-300">
              <code>{responsePayload}</code>
            </pre>
          </div>
        </section>
      </main>
    </WorkspaceShell>
  );
}
