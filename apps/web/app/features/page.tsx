import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageShell } from "../_components/public-page-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Features",
  description: "Understand the end-to-end caption QA pipeline and integrations.",
};

const pipeline = [
  {
    id: "01",
    title: "Upload & Parse",
    body: "Drop VTT or SRT files. CaptionLint builds a normalized cue model to validate structure and timestamps.",
  },
  {
    id: "02",
    title: "Run Rulesets",
    body: "Execute rules for CPS, line length, overlap detection, duration limits, and vocabulary policies.",
  },
  {
    id: "03",
    title: "Review & Fix",
    body: "Findings include severity, rule code, and exact cue context. Apply safe auto-fixes or adjust manually.",
  },
  {
    id: "04",
    title: "Export Clean Artifacts",
    body: "Generate production-ready caption files after review with deterministic outputs.",
  },
] as const;

const integrations = [
  {
    title: "VS Code Extension",
    body: "Real-time linting while editing subtitle files locally.",
    code: "ext install captionlint-vscode",
  },
  {
    title: "GitHub Actions",
    body: "Block merges when caption QA policies fail in pull requests.",
    code: "uses: captionlint/action@v2",
  },
  {
    title: "GitLab CI/CD",
    body: "Run lint checks in pipelines and fail builds on structural violations.",
    code: "image: captionlint/cli:latest",
  },
] as const;

export default function FeaturesPage() {
  return (
    <PublicPageShell active="features" showAuthCta={false} mainClassName="pb-24">
      <section className="mb-16 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Precision linting for structural text.
        </h1>
        <p className="text-zinc-400">
          Built for technical accuracy. Catch linguistic inconsistencies, timing errors, and
          formatting violations before they merge.
        </p>
      </section>

      <section className="mb-20">
        <div className="mb-5 border-b border-[#3d4a3d] pb-3">
          <h2 className="text-2xl font-semibold">Pipeline Execution</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {pipeline.map((step) => (
            <Card key={step.id} className="border-[#3d4a3d] bg-[#111112]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span className="grid size-8 place-items-center rounded-full border border-[#3d4a3d] bg-[#18181B] font-mono text-xs text-[#22C55E]">
                    {step.id}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-zinc-400">
                  {step.body}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {featureFlags.showAdvancedIntegrations ? (
        <section>
          <div className="mb-5 border-b border-[#3d4a3d] pb-3">
            <h2 className="text-2xl font-semibold">Native Workflows</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.title} className="border-[#3d4a3d] bg-[#111112]">
                <CardHeader>
                  <CardTitle className="text-lg">{integration.title}</CardTitle>
                  <CardDescription className="text-zinc-400">{integration.body}</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="inline-flex rounded border border-[#353436] bg-[#0A0A0B] px-2 py-1 font-mono text-xs text-zinc-300">
                    {integration.code}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </PublicPageShell>
  );
}
