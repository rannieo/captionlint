import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { docsSections } from "@/lib/docs-data";
import { DocsSidebar } from "../_components/docs-sidebar";
import { PublicPageShell } from "../_components/public-page-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Documentation",
  description: "Introduction and implementation guides for CaptionLint.",
};

export default function DocsIntroPage() {
  if (!featureFlags.showDocsPortal) {
    notFound();
  }

  return (
    <PublicPageShell active="product" showAuthCta={false} mainClassName="pb-24">
      <div className="grid gap-8 md:grid-cols-[250px_minmax(0,1fr)]">
        <DocsSidebar active="intro" />

        <div>
          <div className="mb-10 border-b border-[#1E293B] pb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Documentation
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Introduction to CaptionLint</h1>
            <p className="max-w-3xl text-zinc-400">
              CaptionLint is a deterministic QA layer for subtitle files. It validates structure,
              timing, readability, and vocabulary consistency across SRT and VTT workflows.
            </p>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <Card className="border-[#3d4a3d] bg-[#111112]">
              <CardHeader>
                <CardTitle>Core Capabilities</CardTitle>
                <CardDescription className="text-zinc-400">
                  Readability checks, timing checks, and vocabulary protection.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-400">
                Findings are deterministic and include severity, rule code, cue reference, and
                fix guidance when available.
              </CardContent>
            </Card>

            <Card className="border-[#3d4a3d] bg-[#111112]">
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
                <CardDescription className="text-zinc-400">
                  SRT and VTT input with configurable platform presets.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-400">
                Use presets for TikTok, Instagram, YouTube Shorts, or define custom rule limits per
                workspace.
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docsSections.map((section) => (
              <Card key={section.slug} className="border-[#3d4a3d] bg-[#111112]">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-zinc-400">{section.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/docs/${section.slug}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#353436] bg-[#18181B] px-4 text-sm font-medium text-zinc-100 hover:bg-[#201f20]"
                  >
                    Open
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
