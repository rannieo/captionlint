export type DocsSlug =
  | "quick-start"
  | "configuration"
  | "cli-reference"
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
        heading: "Install CLI",
        body: "Install CaptionLint globally or run from your project workspace.",
        code: "pnpm dlx captionlint run ./captions.srt --preset youtube-shorts",
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
    slug: "cli-reference",
    title: "CLI Reference",
    summary: "All command flags for linting, export, and history workflows.",
    blocks: [
      {
        heading: "Run",
        body: "Analyze one file or a batch directory.",
        code: "captionlint run ./captions --preset instagram --format json",
      },
      {
        heading: "Fix",
        body: "Apply safe fixes and emit a patched output file.",
        code: "captionlint fix ./captions.srt --out ./captions.fixed.srt",
      },
      {
        heading: "History",
        body: "Inspect previous runs and replay with a different preset.",
        code: "captionlint history --query product-demo --preset youtube-shorts",
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
    summary: "Use CaptionLint with editors, CI pipelines, and team workflows.",
    blocks: [
      {
        heading: "Editor Integration",
        body: "Surface warnings inline while reviewing subtitle files.",
      },
      {
        heading: "CI Validation",
        body: "Fail pull requests when ERROR findings exceed policy thresholds.",
      },
      {
        heading: "Team Operations",
        body: "Share lint history and standardize presets across projects.",
      },
    ],
  },
];

export const docsSectionMap = new Map(docsSections.map((section) => [section.slug, section]));
