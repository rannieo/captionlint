export type ProfileSummary = {
  name: string;
  role: string;
  workspace: string;
};

export type BillingSummary = {
  plan: string;
  nextInvoiceDate: string;
};

export const profileSummary: ProfileSummary = {
  name: "Rannie Ollit",
  role: "Owner",
  workspace: "captionlint-demo",
};

export const billingSummary: BillingSummary = {
  plan: "Pro",
  nextInvoiceDate: "2026-06-01",
};

export const exportDefaults: string[] = [
  "format: SRT",
  "line-endings: LF",
  "timezone: UTC",
];
