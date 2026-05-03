# AGENTS.md — CaptionLint

## Purpose

This file guides AI coding agents working on CaptionLint.

CaptionLint is a clean caption QA workflow with room to expand. It is **QA for captions users already have**: upload captions, choose preset, run QA, review findings, export cleaner captions.

This project should stay focused, research-first, and implementation-safe.

---

## Non-Negotiable Rule: Research Before Implementation

Before implementing any solution, agents must complete a short research pass.

Do not start coding immediately unless the task is a trivial copy/text/style change with no dependency, API, security, or architecture impact.

For every meaningful change, produce a short implementation note first:

```md
## Research Brief

### Task
What are we trying to change?

### Existing Code Checked
Files/modules inspected before changing code.

### External Docs Checked
Context7 docs, official docs, release notes, or web references checked.

### Decision
Chosen approach and why.

### Impact
API impact, DB impact, UI impact, test impact.

### Risks
Known tradeoffs or things intentionally deferred.
```

If research shows uncertainty, stale docs, unclear behavior, or conflicting guidance, stop and ask for direction before implementing.

---

## Required Research Sources

### 1. Use Context7 for library/framework documentation

When implementing anything involving libraries, frameworks, or SDKs, use Context7 first.

Use Context7 for:
- Next.js
- React
- Fastify
- BullMQ
- Redis clients
- PostgreSQL client/ORM
- Tailwind CSS
- shadcn/ui
- Zod or validation libraries
- file upload libraries
- S3-compatible storage SDKs
- testing libraries
- any new dependency

Expected Context7 workflow:

```txt
resolve-library-id
→ query-docs for the exact task
→ summarize current recommended usage
→ implement only after checking docs
```

Do not rely only on memory for framework APIs, especially if the library may have changed.

### 2. Use web search for current behavior and risks

Use web search when:
- library behavior may have changed
- API/deprecation status matters
- security implications exist
- uploads, auth, storage, billing, queues, or background jobs are involved
- comparing implementation approaches
- checking official examples or release notes
- verifying browser/platform standards

Prefer sources in this order:
1. official docs
2. official GitHub repo/issues/releases
3. standards documents
4. trusted engineering blogs
5. community posts only as supporting context

Do not implement based only on StackOverflow, Reddit, or random blog posts.

### 3. Use local project context first

Before external research, inspect the repository:
- existing folder structure
- package.json / workspace files
- existing modules
- existing naming conventions
- existing tests
- existing docs
- existing design tokens/components

Never introduce a pattern that conflicts with the current codebase without explaining why.

---

## Agent Roles

Agents should collaborate conceptually through these roles. A single coding assistant may perform multiple roles, but the reasoning must cover them.

### Product Context Agent

Focus:
- preserve CaptionLint positioning
- avoid scope creep
- confirm the change supports the clean caption QA workflow

Checks:
- Is this still QA for captions users already have?
- Are we accidentally becoming a caption generator/editor?
- Is this MVP or future scope?

Output:
- product fit notes
- recommended scope cut if needed

### Codebase Research Agent

Focus:
- inspect existing implementation before changing code
- identify affected files
- identify conventions already used

Checks:
- What files already solve similar problems?
- Are there existing components/services/types to reuse?
- Are there tests to update?

Output:
- affected files
- reusable modules
- possible refactor risk

### Documentation Research Agent

Focus:
- use Context7 and official docs
- verify current framework/library usage

Checks:
- Is the API current?
- Are there deprecations?
- Are examples version-compatible?
- Are there security warnings?

Output:
- docs checked
- implementation constraints
- recommended API usage

### Web Research Agent

Focus:
- web verification for current information, standards, and security-sensitive tasks

Use for:
- auth
- file uploads
- object storage
- background queues
- billing
- security headers
- dependency vulnerabilities
- accessibility claims
- caption/subtitle standards

Output:
- trusted references checked
- relevant current guidance
- risks or caveats

### Architecture Agent

Focus:
- keep the architecture simple and expandable

Checks:
- Does this belong in web, api, worker, or package?
- Is this logic reusable?
- Is the lint engine deterministic?
- Are we avoiding heavy framework complexity?

Output:
- recommended layer
- data flow
- dependency impact

### Security & Privacy Agent

Focus:
- protect uploaded caption content and private roadmap

Checks:
- Are we logging caption contents?
- Are file URLs signed or protected?
- Are secrets kept out of code?
- Are user files stored safely?
- Is public copy avoiding implementation leaks?

Output:
- privacy risks
- security requirements
- safe logging recommendations

### Test Agent

Focus:
- ensure changes are testable and covered

Checks:
- What unit tests are needed?
- What integration tests are needed?
- Are lint rules tested as pure functions?
- Are edge cases covered?

Output:
- tests to add/update
- edge cases
- regression risk

### UI Quality Agent

Focus:
- avoid AI-slop UI and keep the product credible

Checks:
- Does the UI look like a real tool?
- Are we using real product states?
- Are there fake charts or meaningless visuals?
- Is the layout clean, dense, and readable?

Output:
- UI quality notes
- component reuse suggestions

---

## Implementation Gate

Before writing code, agents must answer:

```md
## Implementation Gate

- [ ] I inspected the relevant existing files.
- [ ] I checked Context7 for affected libraries.
- [ ] I used web search when the task depends on current behavior, security, or standards.
- [ ] I identified API/DB/UI/test impact.
- [ ] I avoided scope creep.
- [ ] I have a small implementation plan.
```

If any checkbox cannot be completed, explain why.

---

## Project Direction

CaptionLint is not:
- an AI caption generator
- a full subtitle editor
- a video editor
- a transcription platform
- a broad media suite
- a legal compliance certification product

CaptionLint is:
- a caption QA layer
- a linting/reporting tool
- a clean workflow for captions users already have
- a focused product that can expand later

North star:

```txt
Upload captions → choose preset → run QA → review issues → export
```

---

## MVP Scope

Prioritize:
1. SRT/VTT parsing
2. deterministic lint engine
3. platform presets
4. upload flow
5. lint results page
6. export flow
7. Vocabulary Rules
8. History
9. auth/pricing polish

Defer unless explicitly requested:
- CLI
- API playground
- enterprise compliance workflows
- broadcast delivery packages
- advanced team approvals
- full subtitle editing timeline
- transcription/generation
- AI rewrite features
- marketplace/integrations

---

## Preferred Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui only when useful

Backend:
- Fastify
- TypeScript
- PostgreSQL
- Redis/BullMQ for jobs
- S3-compatible storage

Monorepo:

```txt
apps/
  web/
  api/
  worker/

packages/
  caption-parser/
  lint-engine/
  shared-types/
  config/
```

Do not introduce a new major framework, ORM, queue, auth provider, or storage strategy without research and explanation.

---

## Coding Standards

Use TypeScript.

General rules:
- prefer explicit types
- avoid `any`
- avoid large files
- avoid business logic inside React components
- avoid business logic inside route handlers
- keep lint rules as pure functions
- keep services testable
- use shared schemas for validation
- avoid hidden side effects

Preferred backend flow:

```txt
route handler
→ service
→ repository
→ domain/lint engine
```

Preferred frontend flow:

```txt
page
→ feature component
→ reusable UI component
→ typed API client
```

---

## Lint Engine Rules

The lint engine must be deterministic.

Same input + same ruleset + same engine version = same findings.

Initial rule categories:
- readability
- timing
- vocabulary
- structure
- platform preset

Rules should support:
- max characters per line
- max lines per cue
- max characters per second
- min cue duration
- max cue duration
- no overlapping cues
- protected terms must not split across lines
- forbidden terms warning

Findings should include:
- severity: PASS, WARN, ERROR
- rule code
- cue/line reference
- start/end time if applicable
- human-readable message
- suggested fix if available

---

## Platform Presets

Initial presets:
- Default
- TikTok
- Instagram
- YouTube Shorts

Presets must be stored as configuration, not scattered constants.

Do not claim presets are official platform rules unless verified by reliable sources.

---

## Vocabulary Rules

Vocabulary Rules protect words that should remain intact.

Examples:
- ChatGPT
- OpenAI
- Midjourney
- Canva
- YouTube Shorts
- client brand names
- product names
- foreign terms
- technical terms

MVP rules:
- exact match is acceptable
- protected terms should not split across lines
- do not silently change user terms without showing the fix
- store terms per workspace or project

---

## History

History should reduce rework.

Users should be able to:
- see previous lint runs
- search by filename
- filter by preset
- download previous outputs
- re-fix using another preset

Avoid calling History a compliance log in MVP.

---

## UI Standards

Design direction:
- clean
- dark mode first
- technical but approachable
- real lint data
- subtle 1px borders
- high contrast
- no unnecessary decoration

Avoid:
- generic SaaS gradients
- abstract floating blobs
- glassmorphism
- fake analytics charts
- fake AI dashboards
- overanimation
- decorative noise
- screenshots that look generated

Use meaningful product states:
- upload empty state
- lint running
- PASS summary
- WARN findings
- ERROR findings
- export ready
- history empty state
- vocabulary empty state

---

## Security & Privacy Rules

Treat uploaded captions as private user content.

Rules:
- never log full caption contents
- log metadata only where possible
- use signed URLs for upload/download when object storage is added
- store secrets only in environment variables
- do not expose internal strategy, roadmap, prompts, or implementation details in public-facing copy
- validate uploaded file type and size
- sanitize parsed caption content before rendering
- avoid leaking user data in errors

For auth, uploads, storage, billing, and jobs, research current best practices before implementation.

---

## Testing Rules

Tests are required for meaningful logic changes.

Prioritize tests for:
- SRT parser
- VTT parser
- lint engine
- platform preset behavior
- vocabulary protection
- overlap detection
- duration checks
- CPS/CPL checks
- history re-fix behavior
- API validation

Every lint rule should include:
- passing case
- warning/error case
- edge case

Do not rely only on manual UI testing for lint behavior.

---

## Documentation Rules

Update docs when product behavior changes.

Docs to keep aligned:
- README.md
- CLAUDE.md
- AGENTS.md
- docs/design.md
- docs/business-model.md
- API docs if present
- ruleset documentation if behavior changes

When introducing a new rule, document:
- rule code
- purpose
- inputs
- output finding shape
- default severity
- preset overrides

---

## Dependency Rules

Before adding dependencies:
1. inspect if the project already has a solution
2. check Context7 for current library docs
3. web search official docs/release notes if needed
4. evaluate maintenance, size, and security risk
5. explain why it is needed

Avoid dependency bloat.

Prefer small, stable libraries for parsing and validation.

---

## Safe Public Communication

When generating marketing copy, comments, or public replies:

Good:
- "CaptionLint checks captions for readability, timing, and consistency."
- "Upload captions, run QA, export cleaner files."
- "Vocabulary Rules protect brand names from awkward line breaks."
- "History helps re-fix captions across presets."

Avoid:
- algorithm details
- exact internal thresholds unless public
- architecture details
- private roadmap
- implementation tricks
- legal compliance guarantees
- claims that presets are official unless verified

---

## Agent Workflow Summary

For any meaningful task:

```txt
1. Understand the request
2. Inspect local code/docs
3. Identify affected libraries
4. Use Context7 for current docs
5. Use web search for current risks/standards when needed
6. Produce Research Brief
7. Produce Implementation Gate checklist
8. Implement smallest safe change
9. Add/update tests
10. Update docs
11. Summarize what changed
```

If the user asks for speed, still do a minimal research pass before coding.

If the task is risky, ask before implementing.

If the task causes scope creep, propose a smaller MVP-safe version first.
