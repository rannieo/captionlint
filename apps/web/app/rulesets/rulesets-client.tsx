"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultVocabularyTerms } from "@repo/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readVocabularyTerms, writeVocabularyTerms } from "@/lib/workflow-storage";

export function RulesetsClient() {
  const [terms, setTerms] = useState<string[]>(defaultVocabularyTerms);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Exact matching is used for MVP protected terms.");

  useEffect(() => {
    setTerms(readVocabularyTerms() ?? defaultVocabularyTerms);
  }, []);

  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return terms;
    return terms.filter((term) => term.toLowerCase().includes(normalizedQuery));
  }, [query, terms]);

  function saveTerms(nextTerms: string[]) {
    setTerms(nextTerms);
    writeVocabularyTerms(nextTerms);
  }

  function addTerm() {
    const term = draft.trim();
    if (!term) return;
    if (terms.some((item) => item.toLowerCase() === term.toLowerCase())) {
      setMessage(`${term} is already protected.`);
      return;
    }
    saveTerms([...terms, term].sort((a, b) => a.localeCompare(b)));
    setDraft("");
    setMessage(`${term} will be checked during future lint runs.`);
  }

  function removeTerm(term: string) {
    saveTerms(terms.filter((item) => item !== term));
    setMessage(`${term} removed from future lint runs.`);
  }

  return (
    <div className="mt-12 flex flex-col overflow-auto md:h-[calc(100vh-48px)] md:flex-row md:overflow-hidden">
      <aside className="w-full overflow-y-auto border-b border-[#1F2937] bg-[#111827] p-6 md:w-[320px] md:shrink-0 md:border-b-0 md:border-r">
        <h3 className="mb-1 text-lg font-semibold text-zinc-100">Add Protected Term</h3>
        <p className="mb-6 text-sm text-zinc-400">Protect brand names, product names, and technical terms from awkward line breaks.</p>

        <form className="flex flex-col gap-5" onSubmit={(event) => { event.preventDefault(); addTerm(); }}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Term</label>
            <Input
              className="border-[#1F2937] bg-[#0B0F14] font-mono text-sm text-[#22C55E]"
              placeholder="e.g. ChatGPT"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>

          <div className="rounded border border-[#1F2937] bg-[#0B0F14] p-3 text-xs text-zinc-400">
            Terms are matched exactly for MVP. Regex, wildcards, and advanced case settings are future scope.
          </div>

          <Button type="submit" variant="outline" className="w-full border-[#1F2937] bg-[#1F2937] text-zinc-100 hover:bg-zinc-700">
            + Save Term
          </Button>
        </form>
      </aside>

      <section className="flex flex-1 flex-col overflow-hidden bg-[#0B0F14]">
        <div className="flex items-center justify-between border-b border-[#1F2937] bg-[#111827] px-4 py-3 md:px-6">
          <div className="relative w-48 md:w-64">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
            <Input
              className="h-8 border-[#1F2937] bg-[#0B0F14] pl-7 font-mono text-xs"
              placeholder="Filter terms..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 sm:inline">
            {terms.length} Terms Active
          </span>
        </div>

        <div className="border-b border-[#1F2937] bg-[#0B0F14] px-4 py-2 text-xs text-zinc-400 md:px-6">{message}</div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
            <Table>
              <TableHeader className="bg-[#1F2937]">
                <TableRow className="border-b border-[#1F2937] hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Protected Term</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Behavior</TableHead>
                  <TableHead className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerms.map((term) => (
                  <TableRow key={term} className="group border-b border-[#1F2937] hover:bg-zinc-900">
                    <TableCell className="px-4 py-3">
                      <span className="font-mono text-sm text-[#22C55E]">{term}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline" className="h-auto rounded border-transparent bg-[#1F2937] px-2 py-0.5 text-[10px] text-zinc-100">
                        Exact match, keep intact
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-zinc-400 hover:text-[#ef4444]" onClick={() => removeTerm(term)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}
