import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingShell } from "../../_components/onboarding-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Onboarding Complete",
  description: "Final review and success state for workspace onboarding.",
};

const stats = [
  { label: "Rules Active", value: "42" },
  { label: "Members Invited", value: "3" },
  { label: "Default Preset", value: "Strict Broadcast" },
];

export default function OnboardingSuccessPage() {
  if (!featureFlags.showTeamOnboarding) {
    notFound();
  }

  return (
    <OnboardingShell active="success">
      <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-3xl items-center p-6 md:p-10">
        <div className="w-full">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-semibold tracking-tight">Project Ready.</h1>
            <p className="mx-auto max-w-xl text-sm text-zinc-400">
              Your workspace, linting rules, and team structure are now configured.
            </p>
          </div>

          <Card className="mb-6 border-[#1E293B] bg-[#111112]">
            <CardHeader>
              <CardTitle>Active Project Environment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded border border-[#353436] bg-[#0A0A0B] p-4 text-center"
                >
                  <p className="mb-1 text-2xl font-semibold text-zinc-100">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">{stat.label}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Button className="h-11 w-full bg-[#22C55E] text-base text-[#003915] hover:bg-[#4BE277]">
            Upload Your First File
          </Button>
        </div>
      </main>
    </OnboardingShell>
  );
}
