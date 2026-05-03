import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingShell } from "../../_components/onboarding-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Onboarding Team",
  description: "Invite team members during onboarding.",
};

const members = [
  { initials: "JD", name: "Jane Doe (You)", email: "jane@captionlint.io", role: "Admin", status: "Active" },
  { initials: "MR", name: "Mark Roberts", email: "mark@captionlint.io", role: "Editor", status: "Pending" },
  { initials: "SL", name: "Sarah Lee", email: "sarah@captionlint.io", role: "Viewer", status: "Active" },
];

export default function OnboardingTeamPage() {
  if (!featureFlags.showTeamOnboarding) {
    notFound();
  }

  return (
    <OnboardingShell active="team">
      <main className="mx-auto max-w-6xl p-6 md:p-10">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Step 3 of 4</p>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Team Members</h1>
          <p className="text-sm text-zinc-400">
            Invite collaborators and set role access for this workspace.
          </p>
        </div>

        <Card className="mb-4 border-[#1E293B] bg-[#111112]">
          <CardHeader>
            <CardTitle>Invite via Email</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input placeholder="colleague@domain.com" className="border-[#353436] bg-[#0A0A0B]" />
            <Select>
              <SelectTrigger className="border-[#353436] bg-[#0A0A0B]">
                <SelectValue placeholder="Editor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Send Invite</Button>
          </CardContent>
        </Card>

        <Card className="border-[#1E293B] bg-[#111112]">
          <CardHeader>
            <CardTitle>Invited Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((member) => (
              <div
                key={member.email}
                className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1E293B] bg-[#0A0A0B] p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-full border border-[#353436] bg-[#18181B] font-mono text-xs text-zinc-300">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-100">{member.name}</p>
                    <p className="text-xs text-zinc-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded border border-[#353436] bg-[#18181B] px-2 py-1 text-zinc-300">
                    {member.status}
                  </span>
                  <span className="rounded border border-[#353436] bg-[#18181B] px-2 py-1 text-zinc-300">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" className="text-zinc-400 hover:bg-[#18181B]">
            Skip for now
          </Button>
          <Button className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Continue to Review</Button>
        </div>
      </main>
    </OnboardingShell>
  );
}
