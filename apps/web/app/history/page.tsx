import type { Metadata } from "next";
import { historyRuns } from "../../lib/history-data";
import { HistoryClient } from "./history-client";

export const metadata: Metadata = {
  title: "CaptionLint | Linting History",
  description: "Review historical linting runs, applied presets, and fixed violations across your workspace.",
};

export default function HistoryPage() {
  return <HistoryClient runs={historyRuns} />;
}
