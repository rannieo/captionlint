import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "CaptionLint Docs | Quick Start",
  description:
    "Setup, run, and interpret CaptionLint checks for readability, timing, vocabulary, and structure.",
};

const docsSections = [
  {
    id: "quick-start",
    title: "Quick Start",
    points: [
      "Upload an SRT or VTT file.",
      "Choose a preset (Default, TikTok, Instagram, YouTube Shorts).",
      "Run lint and review PASS/WARN/ERROR findings.",
      "Export the revised output.",
    ],
  },
  {
    id: "rules",
    title: "Rule Categories",
    points: [
      "Readability: max characters per line and cue.",
      "Timing: cps threshold, min/max cue duration.",
      "Structure: overlap detection and cue sequencing.",
      "Vocabulary: protected term split detection.",
    ],
  },
  {
    id: "determinism",
    title: "Deterministic Behavior",
    points: [
      "Same input + same ruleset + same engine version = same results.",
      "Findings include severity, rule code, cue reference, and message.",
      "Preset overrides are configuration-based, not hardcoded.",
      "History keeps runs searchable by filename and preset.",
    ],
  },
] as const;

export default function DocsHome() {
  return (
    <div className={styles.pageShell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>CaptionLint Documentation</p>
          <h1>Introduction</h1>
        </div>
        <a
          className={styles.backLink}
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open App
        </a>
      </header>

      <main className={styles.main}>
        {docsSections.map((section) => (
          <section id={section.id} key={section.id} className={styles.docCard}>
            <h2>{section.title}</h2>
            <ul>
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className={styles.note}>
          <h3>Implementation Note</h3>
          <p>
            Platform presets are product defaults, not official platform policy
            documents. Always verify target-delivery specs before final export.
          </p>
          <pre className={styles.tech}>
            {`{\n  "code": "TIMING.CPS.MAX",\n  "severity": "WARN",\n  "value": 17\n}`}
          </pre>
        </section>
      </main>
    </div>
  );
}
