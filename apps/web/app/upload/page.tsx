import type { Metadata } from "next";
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
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";

export const metadata: Metadata = {
  title: "CaptionLint | Upload",
  description: "Upload SRT or VTT files, choose a preset, and run deterministic caption QA.",
};

export default function UploadPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="font-mono text-sm font-semibold text-zinc-100">New Lint Run</span>}
        shareLabel="History"
        exportLabel="Run QA"
      />

      <main className="min-h-screen bg-[#131314] px-6 pb-12 pt-20">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">Upload Captions</h1>
            <p className="text-sm text-zinc-400">
              Upload an SRT or VTT file, select a platform preset, run checks, and export a cleaner file.
            </p>
          </div>

          <Card className="border-[#3d4a3d] bg-[#111112]">
            <CardHeader>
              <CardTitle>Caption File</CardTitle>
              <CardDescription className="text-zinc-400">
                Accepted formats: .srt and .vtt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block rounded border border-dashed border-[#3d4a3d] bg-[#0A0A0B] p-8 text-center text-sm text-zinc-400">
                <div className="mb-3 text-zinc-300">Drag and drop your file here</div>
                <Input type="file" accept=".srt,.vtt" className="mx-auto max-w-xs border-[#353436] bg-[#111112]" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500">Platform Preset</label>
                  <Select>
                    <SelectTrigger className="border-[#353436] bg-[#0A0A0B]">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube-shorts">YouTube Shorts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500">Run Mode</label>
                  <Select>
                    <SelectTrigger className="border-[#353436] bg-[#0A0A0B]">
                      <SelectValue placeholder="Deterministic QA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deterministic">Deterministic QA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Run QA</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </WorkspaceShell>
  );
}
