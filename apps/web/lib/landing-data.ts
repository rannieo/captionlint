import type { Severity } from "./types";

export type LandingFinding = {
  severity: Severity;
  code: string;
  line: string;
  message: string;
  time: string;
};

export type LandingFeatureCard = {
  title: string;
  text: string;
};

export const landingFindings: LandingFinding[] = [
  {
    severity: "WARN",
    code: "TIMING.CPS.MAX",
    line: "12",
    message: "Reading speed too fast (18.2 cps)",
    time: "00:00:28.120 - 00:00:29.820",
  },
  {
    severity: "ERROR",
    code: "VOCAB.SPLIT.PROTECTED",
    line: "25",
    message: 'Protected term split: "ChatG- PT"',
    time: "00:00:52.004 - 00:00:53.100",
  },
  {
    severity: "PASS",
    code: "STRUCT.NO_OVERLAP",
    line: "40",
    message: "No overlap detected",
    time: "00:01:11.400 - 00:01:13.100",
  },
];

export const landingFeatureCards: LandingFeatureCard[] = [
  {
    title: "Vocabulary Rules",
    text: "Protect brand names and technical terms from awkward line breaks.",
  },
  {
    title: "Platform Presets",
    text: "Switch between Default, TikTok, Instagram, and YouTube Shorts constraints.",
  },
  {
    title: "History",
    text: "Re-run previous caption sets under a new preset without re-uploading files.",
  },
  {
    title: "Deterministic Engine",
    text: "Same input + same ruleset + same version = same findings.",
  },
];
