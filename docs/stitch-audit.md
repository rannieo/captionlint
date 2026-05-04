# Stitch Design Audit — CaptionLint v2

**Date:** 2026-05-03  
**Stitch Project:** `projects/15181293185028918235`  
**Status:** Pending fixes

---

## A. Color System — Inconsistent, needs standardization

The Stitch design system defines:
- `bg-primary: #0B0F14` | `bg-secondary: #111827` | `border: #1F2937`

The current `globals.css` has:
- `--background: #131314` | `--card: #201f20` | `--border: #3d4a3d`

The pages are also split between two color families — some use green-tinted (`#201f20`, `#3d4a3d`, `#1c1b1c`) and others use the correct slate-dark (`#111112`, `#1E293B`, `#1F2937`). The Stitch design uses slate-dark consistently.

**Fix:** Update `globals.css` CSS custom properties to match Stitch tokens and normalize inline colors across all pages.

---

## B. History data — Wrong presets (PRD violation)

**File:** `apps/web/lib/history-data.ts`

Current presets in data: `"YouTube Strict"`, `"TikTok Default"`, `"Profanity Filter"`, `"Netflix Standard"`, `"WCAG 2.1 AA"`

PRD-correct presets: `"Default"`, `"TikTok"`, `"Instagram"`, `"YouTube Shorts"`

**Fix:** Replace history data preset names with PRD-defined values.

---

## C. Results page — Missing LintSummary bar

**File:** `apps/web/app/results/page.tsx`

`resultSeverityMetrics` (PASS/WARN/ERROR counts) exist in `results-data.ts` but are never rendered on the page. The Stitch design shows these counts prominently above the findings list.

**Fix:** Render the severity metric badges (18 PASS / 2 WARN / 1 ERROR) at the top of the results layout.

---

## D. Landing page — Copy doesn't match PRD positioning

**File:** `apps/web/app/page.tsx`

Current subheading: *"The ultimate linguistic linting engine for video professionals. Catch spelling errors, sync issues, and brand vocabulary violations in milliseconds."*

PRD says to avoid framing like "linguistic linting engine" or "spelling errors". Correct framing per PRD: *"CaptionLint checks captions for readability, timing, and platform presets. Upload, check, fix, export."*

**Fix:** Update hero subheading and any copy that conflicts with PRD's "QA for captions you already have" positioning.

---

## E. Settings & History topbar — Shows wrong file

**Files:** `apps/web/app/settings/page.tsx`, `apps/web/app/history/page.tsx`

Both pages have `video_final.srt` in the `WorkspaceTopbar` left slot. A filename reference belongs on a lint run page, not on settings or history pages.

**Fix:** Replace with context-appropriate label (e.g., "Workspace Settings", "Linting History").

---

## F. Workspace sidebar navigation — Missing Dashboard

**File:** `apps/web/app/_components/workspace-nav.tsx`

Stitch design and PRD both list Dashboard as an authenticated app page. Current nav:
`Upload → Results → History → Rulesets → Settings`

No `/dashboard` page exists. Stitch shows: `Dashboard → Projects → History → Rulesets → Settings`

PRD authenticated pages: `Dashboard, Upload / New Lint Run, Lint Results, History, Vocabulary Rules, Settings`

**Open question:** Create Dashboard page + add to nav? Or keep current Upload-first nav and skip Dashboard for now?

---

## G. Results finding categories — Out of PRD scope

**File:** `apps/web/lib/results-data.ts`

Current finding categories: `"Grammar"`, `"Style"` — not defined in PRD.

PRD rule categories: `readability`, `timing`, `structure`, `vocabulary`, `preset compatibility`

**Fix:** Update mock finding data to use PRD-defined categories (e.g., `"Reading Speed"` → keep, `"Grammar"` → remove or remap to `"Structure"`, `"Style"` → remap to `"Vocabulary"`).

---

## H. History page heading — Language conflicts with PRD tone

**File:** `apps/web/app/history/page.tsx`

Current h1: `"Execution Log"` (matches Stitch screen label). But PRD says History should feel like "workflow memory, not compliance tracking" — "Execution Log" reads as audit/compliance-heavy.

**Open question:** Keep "Execution Log" (matches Stitch) or change to "Linting History" (matches PRD tone)?

---

## Open Questions (blocking full fix)

1. **Dashboard page:** Do you want a `/dashboard` page created and added to sidebar nav?
2. **History h1:** Keep `"Execution Log"` or rename to `"Linting History"`?

---

## Pages Reviewed

| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | Copy issues, minor color drift |
| Upload | `/upload` | Mostly correct |
| Lint Results | `/results` | Missing LintSummary bar |
| History | `/history` | Wrong preset names, topbar file ref, h1 tone |
| Vocabulary Rulesets | `/rulesets` | Color inconsistency (green-tinted borders) |
| Settings | `/settings` | Topbar file ref, color inconsistency |
| Pricing | `/pricing` | Mostly correct |
| Sign In | `/sign-in` | Not reviewed |
| Create Account | `/create-account` | Not reviewed |

---

## Stitch Screens Reviewed

| Screen Title | Screen ID | Notes |
|---|---|---|
| CaptionLint — Home | `410e2b00` | Source of truth for landing page |
| Lint Results — Dashboard | `0a5e9db3` | Source of truth for results layout |
| Linting History | `819c4d80` | Source of truth for history layout |
| Vocabulary Rulesets | `e6711fe1` | Source of truth for rulesets layout |
| Pricing — CaptionLint | `12767bc2` | Source of truth for pricing layout |
| Workspace Settings | `c9fd6e0c` | Source of truth for settings layout |
