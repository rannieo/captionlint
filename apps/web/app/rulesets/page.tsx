import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { vocabTokens } from "../../lib/rulesets-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "CaptionLint | Vocabulary Rulesets",
  description: "Define protected token strings and vocabulary enforcement rules.",
};

const flagLabels: Record<string, { short: string; title: string }> = {
  case_strict: { short: "Aa", title: "Case Strict" },
  exact_match: { short: '""', title: "Exact Match" },
  regex: { short: ".*", title: "Regex Pattern" },
};

export default function RulesetsPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={
          <>
            <span className="text-sm font-semibold text-[#22C55E]">◈ Global Vocabulary</span>
            <span className="inline-flex rounded border border-[#1F2937] bg-[#1F2937] px-2 py-0.5 font-mono text-xs text-zinc-400">
              v2.4 (Active)
            </span>
          </>
        }
        shareLabel="Share"
        exportLabel="Export"
      />

      <div className="mt-12 flex flex-col overflow-auto md:h-[calc(100vh-48px)] md:flex-row md:overflow-hidden">
        <aside className="w-full overflow-y-auto border-b border-[#1F2937] bg-[#111827] p-6 md:w-[320px] md:shrink-0 md:border-b-0 md:border-r">
          <h3 className="mb-1 text-lg font-semibold text-zinc-100">Add Token</h3>
          <p className="mb-6 text-sm text-zinc-400">Define a new protected string or spelling constraint.</p>

          <form>
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Token String
              </label>
              <Input
                className="border-[#1F2937] bg-[#0B0F14] font-mono text-sm text-[#22C55E]"
                placeholder="e.g. OpenAI"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Category
              </label>
              <Select>
                <SelectTrigger className="border-[#1F2937] bg-[#0B0F14]">
                  <SelectValue placeholder="Brand Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="brand">Brand Name</SelectItem>
                    <SelectItem value="technical">Technical Term</SelectItem>
                    <SelectItem value="person">Name (Person)</SelectItem>
                    <SelectItem value="acronym">Acronym</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2 border-t border-[#1F2937] pt-4">
              <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Enforcement Rules
              </span>
              <label className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 grid size-4 place-items-center rounded border border-[#22C55E] bg-[#22C55E] text-[10px] text-[#0A0A0B]">
                  ✓
                </div>
                <div>
                  <div className="text-sm text-zinc-100">Case Strict</div>
                  <div className="text-xs text-zinc-400">Enforce exact capitalization</div>
                </div>
              </label>

              <label className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 grid size-4 place-items-center rounded border border-[#22C55E] bg-[#22C55E] text-[10px] text-[#0A0A0B]">
                  ✓
                </div>
                <div>
                  <div className="text-sm text-zinc-100">Exact Match</div>
                  <div className="text-xs text-zinc-400">Do not match substrings</div>
                </div>
              </label>

              <label className="mb-2 flex items-start gap-3">
                <div className="mt-0.5 size-4 rounded border border-[#1F2937] bg-[#0B0F14]" />
                <div>
                  <div className="text-sm text-zinc-100">Regex Pattern</div>
                  <div className="text-xs text-zinc-400">Treat token string as regular expression</div>
                </div>
              </label>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full border-[#1F2937] bg-[#1F2937] text-zinc-100 hover:bg-zinc-700"
            >
              + Save Token
            </Button>
          </form>
        </aside>

        <section className="flex flex-1 flex-col overflow-hidden bg-[#0B0F14]">
          <div className="flex items-center justify-between border-b border-[#1F2937] bg-[#111827] px-4 py-3 md:px-6">
            <div className="relative w-48 md:w-64">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
              <Input
                className="h-8 border-[#1F2937] bg-[#0B0F14] pl-7 font-mono text-xs"
                placeholder="Filter tokens..."
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 sm:inline">
                124 Tokens Active
              </span>
              <span className="mx-1 hidden h-4 w-px bg-[#1F2937] sm:block" />
              <button
                type="button"
                className="grid size-7 place-items-center rounded text-zinc-400 hover:bg-[#1F2937] hover:text-zinc-100"
                title="Filter"
              >
                ⊟
              </button>
              <button
                type="button"
                className="grid size-7 place-items-center rounded text-zinc-400 hover:bg-[#1F2937] hover:text-zinc-100"
                title="Sort"
              >
                ⊞
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            <table className="w-full border-collapse overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
              <thead>
                <tr>
                  <th className="w-1/3 border-b border-[#1F2937] bg-[#1F2937] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-zinc-400">
                    Token String
                  </th>
                  <th className="w-1/4 border-b border-[#1F2937] bg-[#1F2937] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-zinc-400">
                    Category
                  </th>
                  <th className="border-b border-[#1F2937] bg-[#1F2937] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-zinc-400">
                    Flags
                  </th>
                  <th className="border-b border-[#1F2937] bg-[#1F2937] px-4 py-3 text-right text-[11px] uppercase tracking-wider text-zinc-400">
                    Hit Count
                  </th>
                  <th className="w-12 border-b border-[#1F2937] bg-[#1F2937] px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {vocabTokens.map((token) => (
                  <tr key={token.token} className="group border-b border-[#1F2937] hover:bg-zinc-900">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-[#22C55E]">{token.token}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-[#1F2937] px-2 py-0.5 text-[10px] text-zinc-100">
                        {token.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {token.flags.map((flag) => (
                          <span
                            key={flag}
                            className="grid size-5 place-items-center rounded border border-[#1F2937] bg-[#1F2937] font-mono text-[11px] text-zinc-400"
                            title={flagLabels[flag]?.title}
                          >
                            {flagLabels[flag]?.short}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-zinc-400">{token.hitCount}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-zinc-500 opacity-0 transition hover:text-[#22c55e] group-hover:opacity-100"
                        title="Edit"
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
