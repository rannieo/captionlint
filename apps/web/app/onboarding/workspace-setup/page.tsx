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
import { OnboardingShell } from "../../_components/onboarding-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Onboarding Workspace Setup",
  description: "Configure project basics during onboarding.",
};

export default function OnboardingWorkspacePage() {
  if (!featureFlags.showTeamOnboarding) {
    notFound();
  }

  return (
    <OnboardingShell active="workspace">
      <main className="mx-auto max-w-3xl p-6 md:p-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Configure your workspace</h1>
          <p className="text-sm text-zinc-400">
            Set up the foundational details for your new linting environment.
          </p>
        </div>

        <Card className="border-[#1E293B] bg-[#111112]">
          <CardHeader>
            <CardTitle>Workspace Details</CardTitle>
            <CardDescription className="text-zinc-400">
              You can change these values later from workspace settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500">Project Name</label>
              <Input placeholder="e.g., Alpha Series" className="border-[#1E293B] bg-[#0A0A0B]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500">Workspace Slug</label>
              <div className="flex items-center rounded border border-[#1E293B] bg-[#0A0A0B]">
                <span className="border-r border-[#1E293B] px-3 py-2 font-mono text-xs text-zinc-500">
                  captionlint.com/
                </span>
                <Input
                  placeholder="alpha"
                  className="border-0 bg-transparent font-mono text-xs focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500">Default Language Profile</label>
              <Select>
                <SelectTrigger className="border-[#1E293B] bg-[#0A0A0B]">
                  <SelectValue placeholder="English (US) - Strict Grammar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-us">English (US) - Strict Grammar</SelectItem>
                  <SelectItem value="en-gb">English (UK) - Standard</SelectItem>
                  <SelectItem value="es-es">Spanish (ES) - Media Localization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Continue to Ruleset</Button>
        </div>
      </main>
    </OnboardingShell>
  );
}
