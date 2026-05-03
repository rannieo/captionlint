import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingShell } from "../../_components/onboarding-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Onboarding Ruleset",
  description: "Configure structural and linguistic rules during onboarding.",
};

export default function OnboardingRulesetPage() {
  if (!featureFlags.showTeamOnboarding) {
    notFound();
  }

  return (
    <OnboardingShell active="ruleset">
      <main className="mx-auto max-w-6xl p-6 md:p-10">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Step 2 of 4</p>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Ruleset Configuration</h1>
          <p className="max-w-3xl text-sm text-zinc-400">
            Define structural limits and linguistic quality checks for this workspace.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <Card className="border-[#1E293B] bg-[#111112] xl:col-span-7">
            <CardHeader>
              <CardTitle>Structural Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "max_chars_per_line", value: "42", desc: "Maximum characters per subtitle line." },
                { name: "max_chars_per_second", value: "15", desc: "Reading speed threshold (CPS)." },
                { name: "max_lines_per_cue", value: "2", desc: "Maximum subtitle lines per cue." },
              ].map((rule) => (
                <div key={rule.name} className="rounded border border-[#1E293B] bg-[#0A0A0B] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <code className="font-mono text-xs text-[#22C55E]">{rule.name}</code>
                    <Input defaultValue={rule.value} className="h-8 w-20 border-[#353436] bg-[#111112] text-center" />
                  </div>
                  <p className="text-xs text-zinc-500">{rule.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4 xl:col-span-5">
            <Card className="border-[#1E293B] bg-[#111112]">
              <CardHeader>
                <CardTitle>Linguistic Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <label className="flex items-center justify-between rounded border border-[#1E293B] bg-[#0A0A0B] px-3 py-2">
                  Profanity Filter
                  <span className="text-[#22C55E]">On</span>
                </label>
                <label className="flex items-center justify-between rounded border border-[#1E293B] bg-[#0A0A0B] px-3 py-2">
                  Spelling Strict Mode
                  <span className="text-zinc-500">Off</span>
                </label>
              </CardContent>
            </Card>

            <Card className="border-[#1E293B] bg-[#111112]">
              <CardHeader>
                <CardTitle>Brand Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <p>Protect casing and spelling for brand names.</p>
                <div className="flex flex-wrap gap-2">
                  {["CaptionLint", "OpenAI", "YouTube Shorts"].map((token) => (
                    <span
                      key={token}
                      className="rounded border border-[#353436] bg-[#0A0A0B] px-2 py-1 font-mono text-xs text-zinc-300"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" className="border-[#353436] bg-[#111112]">
            Back
          </Button>
          <Button className="bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">Continue</Button>
        </div>
      </main>
    </OnboardingShell>
  );
}
