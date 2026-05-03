import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicPageShell } from "./_components/public-page-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Fix caption issues before they go live.",
  description:
    "The ultimate linguistic linting engine for video professionals. Catch spelling errors, sync issues, and brand vocabulary violations in milliseconds.",
};

export default function Home() {
  return (
    <PublicPageShell active="product" mainClassName="pb-24">
      <section className="relative mb-24 grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22C55E]/5 blur-[120px]" />
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded border border-[#2a2a2b] bg-[#201f20] px-3 py-1">
            <span className="size-2 animate-pulse rounded-full bg-[#22C55E]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              v1.2 Now Available
            </span>
          </div>
          <h1 className="mb-6 text-[40px] font-bold leading-[48px] tracking-tight md:text-[56px] md:leading-[64px]">
            Fix caption issues before they go live.
          </h1>
          <p className="mb-8 max-w-lg text-base leading-7 text-zinc-400 md:text-lg">
            The ultimate linguistic linting engine for video professionals. Catch spelling errors,
            sync issues, and brand vocabulary violations in milliseconds.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {featureFlags.showCliMarketing ? (
              <Button className="h-11 bg-[#22C55E] px-6 text-base text-[#003915] hover:bg-[#4BE277]">
                Install CLI <span data-icon="inline-end">⌘</span>
              </Button>
            ) : (
              <Link
                href="/upload"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#22C55E] px-6 text-base font-medium text-[#003915] hover:bg-[#4BE277]"
              >
                Start QA Workflow <span data-icon="inline-end">→</span>
              </Link>
            )}
            <Link
              href="/upload"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#3d4a3d] bg-[#131314] px-6 text-base font-medium hover:bg-[#201f20]"
            >
              Open Workspace <span data-icon="inline-end">↗</span>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#353436] bg-[#0A0A0B] shadow-2xl">
          <div className="flex h-10 items-center gap-2 border-b border-[#353436] bg-[#131314] px-4">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-[#FF5F56]" />
              <div className="size-3 rounded-full bg-[#FFBD2E]" />
              <div className="size-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="ml-4 font-mono text-[11px] text-zinc-500">
              captionlint run ./video_final.srt
            </div>
          </div>
          <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
            <div className="mb-2 text-zinc-500">$ captionlint run ./video_final.srt</div>
            <div className="mb-4 text-[#22C55E]">Linting complete. Found 3 issues.</div>
            <div className="mb-4">
              <span className="mr-4 text-zinc-500">00:01:23,400</span>
              <span className="border-b border-[#ef444455] pb-0.5 text-[#ef4444]">Teh</span> quick
              brown fox
              <div className="mt-1 flex items-center gap-2 pl-24 text-xs text-zinc-500">
                <span className="text-[#ef4444]">⊗</span> [spelling] Did you mean &apos;The&apos;?
              </div>
            </div>
            <div className="mb-4">
              <span className="mr-4 text-zinc-500">00:02:45,100</span>
              Welcome to <span className="border-b border-[#FFBD2E55] pb-0.5 text-[#FFBD2E]">Caption QA</span>
              platform
              <div className="mt-1 flex items-center gap-2 pl-24 text-xs text-zinc-500">
                <span className="text-[#FFBD2E]">⚠</span> [brand-vocab] Use exact brand name:
                &apos;CaptionQA&apos;
              </div>
            </div>
            <div className="mb-2">
              <span className="mr-4 text-zinc-500">00:05:12,900</span>
              <span className="border-b border-[#3b82f655] pb-0.5 text-[#3b82f6]">
                Wait... what are you doing here?!
              </span>
              <div className="mt-1 flex items-center gap-2 pl-24 text-xs text-zinc-500">
                <span className="text-[#3b82f6]">ℹ</span> [duration] Line is too long for screen
                reading time (38 CPS).
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#353436] pt-4 text-xs text-zinc-500">
              <span>
                Press{" "}
                <kbd className="rounded border border-[#2a2a2b] bg-[#201f20] px-1.5 py-0.5 text-zinc-200">
                  F
                </kbd>{" "}
                to auto-fix safe issues
              </span>
              <span>Processed in 42ms</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-[32px] font-bold tracking-tight">
            Precision tools for modern workflows
          </h2>
          <p className="mx-auto max-w-2xl text-base text-zinc-400">
            Everything you need to ensure pristine subtitle files, built for speed and integration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="flex flex-col rounded-xl border border-[#353436] bg-[#131314] p-8 transition-colors hover:border-[#3d4a3d]">
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24]">✦</div>
            <h3 className="mb-2 text-lg font-semibold">Vocabulary Rules</h3>
            <p className="mb-6 flex-1 text-sm text-zinc-400">
              Enforce strict brand dictionaries. Never let an unapproved product name, acronym, or
              stylistic choice slip through into production again.
            </p>
            <div className="rounded-lg border border-[#353436] bg-[#0A0A0B] p-4">
              <div className="mb-2 flex items-center justify-between border-b border-[#353436] pb-2">
                <span className="font-mono text-xs text-zinc-100">brand_dict.json</span>
                <span className="rounded bg-[#22C55E1a] px-2 py-0.5 text-[10px] uppercase text-[#22C55E]">
                  Active
                </span>
              </div>
              <div className="font-mono text-[11px] text-zinc-400">
                &quot;target&quot;: <span className="text-[#22C55E]">&quot;CaptionQA&quot;</span>
                <br />
                &quot;reject&quot;: [<span className="text-[#FF5F56]">&quot;Caption QA&quot;</span>,{" "}
                <span className="text-[#FF5F56]">&quot;Caption-QA&quot;</span>]
              </div>
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-[#353436] bg-[#131314] p-8 transition-colors hover:border-[#3d4a3d]">
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24]">⊞</div>
            <h3 className="mb-2 text-lg font-semibold">Platform Presets</h3>
            <p className="mb-6 flex-1 text-sm text-zinc-400">
              Pre-configured constraints for TikTok, Instagram, YouTube, and broadcast. Automatically
              check CPS, line lengths, and cue durations.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#353436] bg-[#201f20] px-3 py-1 text-xs">
                ✓ TikTok
              </span>
              <span className="rounded-full border border-[#22C55E33] bg-[#22C55E1a] px-3 py-1 text-xs text-[#22C55E]">
                ◉ YouTube Shorts
              </span>
              <span className="rounded-full border border-[#353436] bg-[#201f20] px-3 py-1 text-xs">
                ✓ Instagram
              </span>
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-[#353436] bg-[#131314] p-8 transition-colors hover:border-[#3d4a3d] md:col-span-2 lg:col-span-1">
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24]">⚡</div>
            <h3 className="mb-2 text-lg font-semibold">Deterministic Engine</h3>
            <p className="mb-6 text-sm text-zinc-400">
              Same input plus same ruleset plus same engine version always returns the same findings.
              Designed for repeatable QA and reliable automation.
            </p>
            <div className="rounded-lg border border-[#353436] bg-[#0A0A0B] p-3">
              <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span>Processing batch_42.zip</span>
                <span>1.2ms / file</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#201f20]">
                <div className="h-1.5 w-[85%] rounded-full bg-[#22C55E]" />
              </div>
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-[#353436] bg-[#131314] p-8 transition-colors hover:border-[#3d4a3d] md:col-span-2 lg:col-span-1">
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24]">◷</div>
            <h3 className="mb-2 text-lg font-semibold">Run History</h3>
            <p className="mb-6 flex-1 text-sm text-zinc-400">
              Track issues over time, compare presets, and re-export older runs without repeating manual
              edits.
            </p>
            <div className="flex h-16 items-end gap-2 opacity-80">
              <div className="h-[40%] w-1/6 rounded-t-sm bg-[#242c24]" />
              <div className="h-[60%] w-1/6 rounded-t-sm bg-[#242c24]" />
              <div className="h-[30%] w-1/6 rounded-t-sm bg-[#242c24]" />
              <div className="h-[80%] w-1/6 rounded-t-sm bg-[#242c24]" />
              <div className="h-[50%] w-1/6 rounded-t-sm bg-[#242c24]" />
              <div className="relative h-[20%] w-1/6 rounded-t-sm border-t-2 border-[#22C55E] bg-[#22C55E66]">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] uppercase text-[#22C55E]">
                  New Low
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PublicPageShell>
  );
}
