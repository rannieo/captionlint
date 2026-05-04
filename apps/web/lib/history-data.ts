export type HistoryRun = {
  id: string;
  file: string;
  presets: string[];
  date: string;
  autoFixed: number;
  pending: number;
  pendingLabel: string;
  status: "clean" | "fixed" | "review";
  downloadContent?: string;
  format?: "SRT" | "VTT";
};

export const historyRuns: HistoryRun[] = [
  {
    id: "run-001",
    file: "campaign_v3_final.srt",
    presets: ["YouTube Shorts"],
    date: "2023-10-27 14:32:01",
    autoFixed: 12,
    pending: 0,
    pendingLabel: "0 Pending",
    status: "fixed",
  },
  {
    id: "run-002",
    file: "tiktok_promo_01.vtt",
    presets: ["TikTok", "Default"],
    date: "2023-10-27 11:15:44",
    autoFixed: 3,
    pending: 2,
    pendingLabel: "2 Manual Review",
    status: "review",
  },
  {
    id: "run-003",
    file: "interview_raw_pt1.srt",
    presets: ["Default"],
    date: "2023-10-26 16:45:10",
    autoFixed: 0,
    pending: 0,
    pendingLabel: "0 Violations Found",
    status: "clean",
  },
  {
    id: "run-004",
    file: "webinar_series_ep4.vtt",
    presets: ["Instagram"],
    date: "2023-10-26 09:20:05",
    autoFixed: 45,
    pending: 0,
    pendingLabel: "0 Pending",
    status: "fixed",
  },
];
