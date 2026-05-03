# CaptionLint

## Product Direction

CaptionLint is a clean caption QA workflow with room to expand.

CaptionLint is **QA for captions users already have**. It helps users upload caption/subtitle files, run structured quality checks, review issues, apply safe fixes, and export cleaner captions.

CaptionLint is not:
- a caption generator
- a full subtitle editor
- a video editor
- a transcription platform
- a broad AI content tool

The product should stay focused on the post-generation workflow:

```txt
Upload captions → choose preset → run QA → review issues → export
```

## Current Product Focus

The MVP should prioritize:
- SRT and VTT support
- Platform presets: Default, TikTok, Instagram, YouTube Shorts
- Readability checks
- Timing checks
- Vocabulary Rules
- History
- Clean export workflow

Avoid expanding into broadcast-grade compliance, CLI tooling, API marketplaces, or full editing workflows until the core caption QA experience is strong.

## Target Users

Primary early users:
- content creators
- freelance video editors
- social media teams
- small media teams
- captioning/subtitle vendors later

Design and copy should be understandable to creators, but the product should feel credible enough for technical and professional users.

## Positioning Language

Preferred phrases:
- "QA for captions you already have"
- "Fix caption issues before they go live"
- "Validate captions before publishing"
- "Clean captions, fewer reworks"
- "Upload, check, fix, export"

Avoid these phrases:
- "AI caption generator"
- "automatic subtitle creator"
- "full compliance solution"
- "broadcast-certified"
- "guaranteed accessibility compliance"

Use compliance language carefully. Say "QA reports", "accessibility-aware checks", or "compliance-ready foundations" only when appropriate. Do not imply legal or regulatory compliance unless the feature actually supports it.

## Design Direction

The UI should feel like a modern developer/SaaS tool.

Inspired by:
- Linear
- Vercel
- GitHub

But do not copy any product directly.

Design principles:
- clean over flashy
- functional over decorative
- real product data over fake marketing graphics
- subtle borders over heavy shadows
- no AI slop
- no generic SaaS gradients
- no glassmorphism
- no random abstract shapes
- no fake charts unless the data is meaningful

Default visual direction:
- dark mode first
- flat colors
- subtle 1px borders
- high contrast text
- dense but readable layouts

Preferred colors:
- Background: `#0B0F14`
- Panel/card: `#111827`
- Border: `#1F2937`
- Text primary: `#F9FAFB`
- Text secondary: `#9CA3AF`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Accent: `#3B82F6`

Typography:
- UI shell: Geist or Inter
- Technical data/timecodes: Geist Mono or JetBrains Mono

## Product Pages

Public pages:
- Landing page
- Pricing page
- Login/signup

Authenticated app pages:
- Dashboard
- Upload / New Lint Run
- Lint Results
- History
- Vocabulary Rules
- Settings

Future pages:
- Docs
- API keys
- Team management
- Batch processing
- Compliance reports
- CLI reference
- API playground

Do not build future pages unless explicitly requested.

## Core UX Flows

### Flow 1: Basic Caption QA

```txt
Upload SRT/VTT
→ choose platform preset
→ run lint
→ review PASS/WARN/ERROR findings
→ export fixed file
```

### Flow 2: Vocabulary Rules

```txt
Add protected terms
→ run lint
→ prevent awkward word breaks
→ export cleaner captions
```

Examples of protected terms:
- ChatGPT
- OpenAI
- Midjourney
- Canva
- YouTube Shorts
- client brand names
- product names
- foreign terms
- technical terms

### Flow 3: History

```txt
Open previous lint run
→ choose new platform preset
→ re-fix caption
→ download new output
```

History exists to reduce re-uploading and re-fixing.

## Lint Result UX

The Lint Results page is the core product experience.

Use a split layout when possible:
- left side: findings list
- right side: caption preview

Findings should use clear severity:

```txt
PASS  — no issue
WARN  — should review
ERROR — must fix before export
```

Example finding output:

```txt
WARN — Line 12
Reading speed too fast: 18 CPS

ERROR — Line 25
Protected term split across lines: "ChatG- PT"

WARN — Line 31
Caption duration too short: 0.4s
```

Always show:
- line/cue reference
- severity
- issue code
- human-readable explanation
- suggested fix if available

## Backend Architecture Direction

Preferred stack:
- Frontend: Next.js
- Backend API: Fastify + TypeScript
- Worker: BullMQ + Redis
- Database: PostgreSQL
- Storage: S3-compatible object storage
- Monorepo: pnpm workspace or Turborepo-style layout

Recommended structure:

```txt
apps/
  web/               # Next.js frontend
  api/               # Fastify backend API
  worker/            # Background workers

packages/
  caption-parser/    # SRT/VTT parsing
  lint-engine/       # deterministic lint rules
  shared-types/      # DTOs, enums, schemas
  config/            # shared config
```

Do not put heavy lint processing only inside Next.js route handlers. The lint engine should be reusable by API, worker, and future batch/API workflows.

## Backend Domain Model

Core entities:
- Workspace
- User
- Membership
- Project
- Asset
- Ruleset
- LintRun
- Finding
- HistoryItem
- Export
- UsageEvent

Keep the domain simple for MVP.

Do not introduce enterprise concepts too early unless requested:
- approvals
- review queues
- compliance attestations
- multi-stage workflows
- broadcast delivery packages

## Lint Engine Rules

The lint engine must be deterministic.

Same input + same ruleset + same engine version must produce the same findings.

Rules should be configurable through rulesets.

Initial rule categories:
- readability
- timing
- vocabulary
- structure
- platform preset

Example rules:
- max characters per line
- max lines per cue
- max characters per second
- min cue duration
- max cue duration
- no overlapping cues
- protected terms must not split across lines
- forbidden terms warning

Do not hardcode business rules deeply into UI components. Keep rule logic in the lint engine package.

## Platform Presets

Initial presets:
- Default
- TikTok
- Instagram
- YouTube Shorts

Presets should be stored as ruleset configuration, not scattered constants.

A platform preset should control:
- max line length
- max lines
- reading speed threshold
- duration threshold
- formatting preferences

Do not claim these presets are official platform requirements unless verified and documented.

## Vocabulary Rules

Vocabulary Rules protect words that should stay intact.

Rules:
- Protected terms should not be split across lines.
- Matching should support case-sensitive and case-insensitive options later.
- MVP can start with exact matching.
- Store user-defined vocabulary per workspace or project.
- Do not silently alter protected terms without showing the fix.

Good examples:
- `OpenAI`
- `ChatGPT`
- `Midjourney`
- `Canva`
- `YouTube Shorts`

Bad output example:
```txt
ChatG-
PT
```

Good output example:
```txt
ChatGPT
```

## History

History should store previous caption fixes and lint runs.

Users should be able to:
- search by filename
- filter by preset
- download previous output
- re-fix using another preset
- compare previous run summary later

History is a workflow feature, not just an audit log.

Avoid calling it "compliance tracking" in MVP.

## API Design Rules

Use REST-style endpoints for MVP.

Recommended endpoints:
- `POST /assets`
- `GET /assets/:id`
- `POST /lint-runs`
- `GET /lint-runs/:id`
- `GET /lint-runs/:id/findings`
- `POST /lint-runs/:id/export`
- `GET /history`
- `POST /rulesets`
- `GET /rulesets`
- `POST /vocabulary`
- `GET /vocabulary`

Use JSON request/response bodies.

Validate all input using shared schemas.

Do not expose internal engine details unnecessarily in public API responses.

## Coding Standards

Use TypeScript across frontend, backend, workers, and shared packages.

General rules:
- keep modules small
- prefer explicit types
- avoid `any`
- avoid large god files
- avoid business logic inside React components
- avoid business logic inside route handlers
- keep lint rules testable as pure functions
- write code that can be understood by backend developers

Prefer this structure:

```txt
route handler
→ service
→ repository
→ domain/lint engine
```

## Frontend Standards

Use:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui if already installed or approved

Frontend rules:
- dark mode first
- use reusable components
- keep product UI realistic
- use real lint-style data
- avoid fake analytics charts
- avoid generic SaaS sections
- avoid gradients unless explicitly requested
- do not overanimate

Core components:
- AppShell
- Sidebar
- TopNav
- UploadDropzone
- PresetSelector
- LintSummary
- FindingList
- CaptionPreview
- SeverityBadge
- VocabularyTable
- HistoryTable

## Backend Standards

Use:
- Fastify
- TypeScript
- PostgreSQL
- Redis/BullMQ for async jobs

Backend rules:
- validate request bodies
- return clear error responses
- keep services testable
- use idempotency for lint runs where applicable
- store files outside the database
- store metadata in PostgreSQL
- use workers for long-running lint/export jobs

Do not introduce a heavy framework like NestJS unless explicitly requested.

Do not introduce Python services unless there is a clear need.

## Database Rules

Use PostgreSQL.

Suggested tables:
- users
- workspaces
- memberships
- projects
- assets
- rulesets
- lint_runs
- findings
- exports
- history_items
- usage_events
- vocabulary_terms

Rulesets should be versioned.

Findings should reference:
- lint run
- cue/line number
- start time
- end time
- severity
- rule code
- message
- suggested fix

Usage events should be append-only.

## Testing Rules

Add tests for:
- SRT parser
- VTT parser
- lint rule evaluation
- vocabulary protection
- platform preset behavior
- history re-fix behavior
- API validation

Lint engine tests are more important than UI snapshot tests.

Every lint rule should have:
- valid case
- warning/error case
- edge case

## Security & Privacy

Treat uploaded captions as user content.

Rules:
- never log full caption contents in application logs
- log metadata only where possible
- avoid exposing file URLs directly unless signed/temporary
- do not store secrets in source code
- do not expose internal implementation details in public marketing copy
- do not leak private product strategy, prompts, internal docs, or pricing experiments

Use environment variables for secrets.

Use signed upload/download URLs when object storage is implemented.

## Marketing & Copy Rules

Public copy should be confident but not reveal implementation details.

Good:
- "CaptionLint checks captions for readability, timing, and consistency."
- "Upload captions, run QA, export cleaner files."
- "Vocabulary Rules protect brand names from awkward line breaks."

Avoid:
- algorithm details
- architecture details
- internal metrics
- private roadmap
- unreleased features
- anything that sounds like legal compliance certification

## Build Behavior for Claude

When working on this repo:

1. Inspect existing files before changing architecture.
2. Do not rewrite the whole app unless requested.
3. Prefer small, reviewable changes.
4. Keep the product focused.
5. Do not add new dependencies without a clear reason.
6. Do not create fake dashboards or fake charts.
7. Do not use AI-slop UI patterns.
8. Preserve existing naming conventions.
9. Add or update tests when changing lint logic.
10. Update documentation when changing product behavior.

Before implementing a feature, briefly identify:
- affected files
- data model impact
- API impact
- UI impact
- test impact

## MVP Priority Order

Build in this order:

1. Caption parser
2. Lint engine
3. Platform presets
4. Upload flow
5. Lint results page
6. Export flow
7. Vocabulary Rules
8. History
9. Pricing/auth polish
10. Team/vendor features later

If a requested feature conflicts with MVP focus, suggest a smaller version first.

## Current North Star

CaptionLint should feel like:

```txt
Clean caption QA workflow.
Fast to understand.
Useful in one upload.
Professional enough to trust.
Simple enough to ship.
Expandable later.
```
