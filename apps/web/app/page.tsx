import type { Metadata } from "next";
import { PublicPageShell } from "./_components/public-page-shell";
import { StartQaButton } from "./_components/start-qa-button";

export const metadata: Metadata = {
  title: "CaptionLint | Fix caption issues before they go live.",
  description:
    "CaptionLint checks captions for readability, timing, and platform presets. Upload, check, fix, export.",
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
              MVP caption QA workflow
            </span>
          </div>
          <h1 className="mb-6 text-[40px] font-bold leading-[48px] tracking-tight md:text-[56px] md:leading-[64px]">
            Fix caption issues before they go live.
          </h1>
          <p className="mb-8 max-w-lg text-base leading-7 text-zinc-400 md:text-lg">
            CaptionLint checks captions for readability, timing, and platform presets. Upload,
            check, fix, export.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <StartQaButton />
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
              video_final.srt · YouTube Shorts preset
            </div>
          </div>
          <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
            <div className="mb-2 text-zinc-500">CaptionLint QA report</div>
            <div className="mb-4 text-[#22C55E]">Linting complete. Found 3 issues.</div>
            <div className="mb-4">
              <span className="mr-4 text-zinc-500">00:01:23,400</span>
              This caption line is too dense for the selected preset.
              <div className="mt-1 flex items-center gap-2 pl-24 text-xs text-zinc-500">
                <span className="text-[#ef4444]">⊗</span> [readability] Reading speed is too fast.
              </div>
            </div>
            <div className="mb-4">
              <span className="mr-4 text-zinc-500">00:02:45,100</span>
              Welcome to <span className="border-b border-[#FFBD2E55] pb-0.5 text-[#FFBD2E]">Caption-</span>
              <br />
              <span className="pl-24 text-[#FFBD2E]">Lint</span>
              <div className="mt-1 flex items-center gap-2 pl-24 text-xs text-zinc-500">
                <span className="text-[#FFBD2E]">⚠</span> [vocabulary] Protected term split across lines.
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
                to export safe fixes
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
            Focused checks for caption files you already have, built around one repeatable QA flow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="flex flex-col rounded-xl border border-[#353436] bg-[#131314] p-8 transition-colors hover:border-[#3d4a3d]">
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24]">✦</div>
            <h3 className="mb-2 text-lg font-semibold">Vocabulary Rules</h3>
            <p className="mb-6 flex-1 text-sm text-zinc-400">
              Protect brand names and technical terms from awkward line breaks.
            </p>
            <div className="rounded-lg border border-[#353436] bg-[#0A0A0B] p-4">
              <div className="mb-2 flex items-center justify-between border-b border-[#353436] pb-2">
                <span className="font-mono text-xs text-zinc-100">brand_dict.json</span>
                <span className="rounded bg-[#22C55E1a] px-2 py-0.5 text-[10px] uppercase text-[#22C55E]">
                  Active
                </span>
              </div>
              <div className="font-mono text-[11px] text-zinc-400">
                &quot;protected&quot;: <span className="text-[#22C55E]">&quot;CaptionLint&quot;</span>
                <br />
                &quot;rule&quot;: <span className="text-[#FFBD2E]">&quot;keep term intact&quot;</span>
              </div>
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-[#353436] bg-[#131314] p-8 transition-colors hover:border-[#3d4a3d]">
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24]">⊞</div>
            <h3 className="mb-2 text-lg font-semibold">Platform Presets</h3>
            <p className="mb-6 flex-1 text-sm text-zinc-400">
              CaptionLint presets for Default, TikTok, Instagram, and YouTube Shorts. Automatically
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
            <div className="mb-6 grid size-12 place-items-center rounded-lg bg-[#242c24] text-white">⚡︎</div>
            <h3 className="mb-2 text-lg font-semibold">Deterministic Engine</h3>
            <p className="mb-6 text-sm text-zinc-400">
              Same input plus same ruleset plus same engine version always returns the same findings.
              Designed for repeatable QA and reliable automation.
            </p>
            <div className="rounded-lg border border-[#353436] bg-[#0A0A0B] p-3">
              <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span>Checking video_final.srt</span>
                <span>same input, same findings</span>
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
            <div className="relative pt-7">
              <div className="flex h-20 items-end gap-1.5">
                <div className="h-[55%] flex-1 rounded-t-sm bg-[#1e2e1e]" />
                <div className="h-[72%] flex-1 rounded-t-sm bg-[#1e2e1e]" />
                <div className="h-[38%] flex-1 rounded-t-sm bg-[#1e2e1e]" />
                <div className="h-[88%] flex-1 rounded-t-sm bg-[#1e2e1e]" />
                <div className="h-[62%] flex-1 rounded-t-sm bg-[#1e2e1e]" />
                <div className="relative h-[22%] flex-1 rounded-t-sm border-t-2 border-[#22C55E] bg-[#22C55E26]">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-[#22C55E]">
                    New Low
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PublicPageShell>
  );
}
