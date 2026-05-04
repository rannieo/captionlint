# CaptionLint

CaptionLint is a focused caption QA workflow for subtitle files users already have.

```txt
Upload captions -> choose preset -> run QA -> review issues -> export
```

The MVP is not a caption generator, transcription tool, video editor, full subtitle editor, public API, or compliance certification product.

## Current Implementation

This repository now includes:

- `apps/web`: Next.js App Router UI for landing, upload, results, history, vocabulary rules, settings, auth shells, and pricing.
- `packages/shared-types`: shared CaptionLint domain types.
- `packages/config`: CaptionLint preset configuration for Default, TikTok, Instagram, and YouTube Shorts.
- `packages/caption-parser`: independent SRT/VTT parser and serializer.
- `packages/lint-engine`: deterministic lint engine for readability, timing, structure, overlap, and protected-term split checks.

The web app currently runs browser-local MVP linting:

- uploaded caption content stays in the browser
- valid `.srt` and `.vtt` files are parsed locally
- findings are generated deterministically from selected preset + vocabulary terms
- safe line-break fixes can be exported as a downloaded caption file
- history and vocabulary terms persist in browser local storage

## MVP Scope

Implemented or scaffolded around the PRD:

- SRT/VTT upload flow
- platform preset selector
- deterministic QA run
- PASS/WARN/ERROR result summary
- findings list with cue focus
- caption preview
- export fixed file
- Vocabulary Rules with exact protected terms
- History search/filter and re-fix entry point

Deferred until after the core workflow is stronger:

- public API and API playground
- CLI
- team management
- batch processing
- compliance reports
- advanced subtitle editing
- transcription or generation

## Development

Use `nvm` before running project commands:

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 24
pnpm install
pnpm dev
```

Common checks:

```bash
pnpm check-types
pnpm lint
pnpm test
pnpm build
```

## Testing

Unit tests currently cover:

- common SRT parsing
- WebVTT parsing
- malformed timestamp warnings
- SRT serialization
- deterministic pass findings
- CPL/CPS findings
- overlap detection
- protected-term split detection and safe fix application
- preset configuration shape

## Design Alignment

Use `docs/PRD.md` as the product source of truth.

Use `docs/STITCH_SCOPE.md` to decide whether a Stitch screen is MVP, gated future work, or reference-only.

Visible MVP copy should avoid claims around official platform rules, legal compliance, API availability, CLI availability, broadcast workflows, batch processing, or AI generation.
