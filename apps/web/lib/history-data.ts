export type HistoryRun = {
  file: string;
  presets: string[];
  date: string;
  autoFixed: number;
  pending: number;
  pendingLabel: string;
  status: "clean" | "fixed" | "review";
};

export const historyRuns: HistoryRun[] = [
  {
    file: "campaign_v3_final.srt",
    presets: ["YouTube Strict"],
    date: "2023-10-27 14:32:01",
    autoFixed: 12,
    pending: 0,
    pendingLabel: "0 Pending",
    status: "fixed",
  },
  {
    file: "tiktok_promo_01.vtt",
    presets: ["TikTok Default", "Profanity Filter"],
    date: "2023-10-27 11:15:44",
    autoFixed: 3,
    pending: 2,
    pendingLabel: "2 Manual Review",
    status: "review",
  },
  {
    file: "interview_raw_pt1.srt",
    presets: ["Netflix Standard"],
    date: "2023-10-26 16:45:10",
    autoFixed: 0,
    pending: 0,
    pendingLabel: "0 Violations Found",
    status: "clean",
  },
  {
    file: "webinar_series_ep4.vtt",
    presets: ["WCAG 2.1 AA"],
    date: "2023-10-26 09:20:05",
    autoFixed: 45,
    pending: 0,
    pendingLabel: "0 Pending",
    status: "fixed",
  },
];
