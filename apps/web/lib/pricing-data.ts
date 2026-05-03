export type PricingFeatureRow = {
  feature: string;
  free: "check" | "dash" | string;
  pro: "check" | "dash" | string;
  team: "check" | "dash" | string;
};

export type PricingPlan = {
  id: string;
  name: string;
  desc: string;
  price: string;
  period: string;
  cta: string;
  featured: boolean;
  features: { icon: string; text: string; muted: boolean }[];
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    desc: "Essential tools for personal projects.",
    price: "$0",
    period: "/mo",
    cta: "Start Free",
    featured: false,
    features: [
      { icon: "schedule", text: "100 min / mo", muted: true },
      { icon: "rule", text: "1 Ruleset", muted: true },
      { icon: "person", text: "1 Seat", muted: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    desc: "For power users and professionals.",
    price: "$29",
    period: "/mo",
    cta: "Upgrade to Pro",
    featured: true,
    features: [
      { icon: "schedule", text: "1,000 min / mo", muted: false },
      { icon: "rule", text: "Unlimited Rulesets", muted: false },
      { icon: "person", text: "1 Seat", muted: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    desc: "Collaborative workflows and integration.",
    price: "$99",
    period: "/mo",
    cta: "Start Team Trial",
    featured: false,
    features: [
      { icon: "schedule", text: "5,000 min / mo", muted: true },
      { icon: "rule", text: "Unlimited Rulesets", muted: true },
      { icon: "group", text: "Up to 5 Seats", muted: true },
    ],
  },
];

export const pricingCompareRows: PricingFeatureRow[] = [
  { feature: "Syntax Highlighting", free: "check", pro: "check", team: "check" },
  { feature: "Custom Dictionaries", free: "dash", pro: "check", team: "check" },
  { feature: "API Access", free: "dash", pro: "dash", team: "check" },
  { feature: "CI/CD Integration", free: "dash", pro: "dash", team: "check" },
  { feature: "Priority Support", free: "Community", pro: "Standard", team: "Priority" },
];

// Legacy export kept for compatibility
export type PricingMetric = {
  value: string;
  label: string;
};

export const pricingMetrics: PricingMetric[] = [
  { value: "1,280 min", label: "Processed this cycle" },
  { value: "184 runs", label: "Completed lint runs" },
  { value: "99.4%", label: "Successful export rate" },
];
