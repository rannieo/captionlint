export type DocsSlug =
  | "quick-start"
  | "configuration"
  | "workflow-memory"
  | "linter-rules"
  | "integrations";

export type DocsSection = {
  slug: DocsSlug;
  title: string;
  summary: string;
  blocks: Array<{
    heading: string;
    body: string;
    code?: string;
  }>;
};

export const docsSections: DocsSection[] = [
  {
    slug: "quick-start",
    title: "Quick Start",
    summary: "Get CaptionLint running in minutes with the default QA preset.",
    blocks: [
      {
        heading: "Start In The App",
        body: "Upload SRT or VTT, choose a platform preset, and run deterministic QA.",
      },
      {
        heading: "Run Your First Lint",
        body: "Upload SRT or VTT, choose a platform preset, and generate findings.",
      },
      {
        heading: "Export Clean Captions",
        body: "Use auto-fix for safe rules, review warnings, then export final captions.",
      },
    ],
  },
  {
    slug: "configuration",
    title: "Configuration",
    summary: "Control lint behavior with deterministic project-level settings.",
    blocks: [
      {
        heading: "Ruleset File",
        body: "Store thresholds in a versioned configuration file.",
        code: `{
  "preset": "tiktok",
  "limits": { "maxCps": 16, "maxCharsPerLine": 42, "maxLinesPerCue": 2 },
  "vocabulary": { "protectedTerms": ["OpenAI", "ChatGPT"] }
}`,
      },
      {
        heading: "Preset Overrides",
        body: "Override only the rules you need without forking the full preset.",
      },
    ],
  },
  {
    slug: "workflow-memory",
    title: "Workflow Memory",
    summary: "How History supports re-fixing captions without re-uploading the same file.",
    blocks: [
      {
        heading: "Re-fix",
        body: "Open a previous run, choose another preset, and start a new lint run from the stored caption file.",
      },
      {
        heading: "Download",
        body: "Download previous fixed outputs when the browser-local run has stored an export.",
      },
      {
        heading: "Search",
        body: "Find previous files by filename and filter by platform preset.",
      },
    ],
  },
  {
    slug: "linter-rules",
    title: "Linter Rules",
    summary: "Rule categories and result semantics for PASS/WARN/ERROR outcomes.",
    blocks: [
      {
        heading: "Readability",
        body: "Checks characters per line, lines per cue, and reading speed (CPS).",
      },
      {
        heading: "Timing",
        body: "Detects overlap, minimum/maximum cue duration, and bad timecodes.",
      },
      {
        heading: "Vocabulary",
        body: "Protects exact brand terms and flags forbidden terminology.",
      },
      {
        heading: "Finding Shape",
        body: "Every finding includes severity, rule code, cue reference, and message.",
      },
    ],
  },
  {
    slug: "integrations",
    title: "Integrations",
    summary: "Future references for connecting CaptionLint to external workflows.",
    blocks: [
      {
        heading: "Editor Integrations",
        body: "Future phase: surface warnings inline while reviewing subtitle files.",
      },
      {
        heading: "Automation",
        body: "Future phase: run caption QA from repeatable external workflows.",
      },
      {
        heading: "Team Operations",
        body: "Future phase: share lint history and standardize presets across teams.",
      },
    ],
  },
];

export const docsSectionMap = new Map(docsSections.map((section) => [section.slug, section]));
