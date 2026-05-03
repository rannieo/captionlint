import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { docsSectionMap, docsSections, type DocsSlug } from "@/lib/docs-data";
import { DocsSidebar } from "../../_components/docs-sidebar";
import { PublicPageShell } from "../../_components/public-page-shell";
import { featureFlags } from "@/lib/feature-flags";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (!featureFlags.showDocsPortal) {
    return [];
  }
  return docsSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!featureFlags.showDocsPortal) {
    return { title: "CaptionLint" };
  }
  const { slug } = await params;
  const section = docsSectionMap.get(slug as DocsSlug);
  if (!section) {
    return { title: "CaptionLint | Documentation" };
  }
  return {
    title: `CaptionLint | ${section.title}`,
    description: section.summary,
  };
}

export default async function DocsSectionPage({ params }: PageProps) {
  if (!featureFlags.showDocsPortal) {
    notFound();
  }

  const { slug } = await params;
  const section = docsSectionMap.get(slug as DocsSlug);

  if (!section) {
    notFound();
  }

  return (
    <PublicPageShell active="product" showAuthCta={false} mainClassName="pb-24">
      <div className="grid gap-8 md:grid-cols-[250px_minmax(0,1fr)]">
        <DocsSidebar active={section.slug} />

        <div>
          <div className="mb-10 border-b border-[#1E293B] pb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Documentation
            </p>
            <h1 className="mb-3 text-4xl font-bold tracking-tight">{section.title}</h1>
            <p className="text-zinc-400">{section.summary}</p>
          </div>

          <div className="space-y-4">
            {section.blocks.map((block) => (
              <Card key={block.heading} className="border-[#3d4a3d] bg-[#111112]">
                <CardHeader>
                  <CardTitle>{block.heading}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-400">
                  <p>{block.body}</p>
                  {block.code ? (
                    <pre className="overflow-x-auto rounded border border-[#353436] bg-[#0A0A0B] p-3 font-mono text-xs text-zinc-300">
                      <code>{block.code}</code>
                    </pre>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
