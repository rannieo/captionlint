import type { Metadata } from "next";
import { pricingCompareRows, pricingPlans } from "../../lib/pricing-data";
import { Button } from "@/components/ui/button";
import { PublicPageShell } from "../_components/public-page-shell";
import { featureFlags } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "CaptionLint | Pricing",
  description:
    "Simple pricing for caption QA workflows across individual creators and editors.",
};

function CheckMark({ kind }: { kind: "green" | "gray" | "dash" }) {
  if (kind === "dash") {
    return <span className="text-base text-[#353436]">—</span>;
  }
  return (
    <span className={kind === "green" ? "text-base text-[#22c55e]" : "text-base text-[#869585]"}>
      ✓
    </span>
  );
}

export default function PricingPage() {
  const visiblePlans = featureFlags.showTeamPlan
    ? pricingPlans
    : pricingPlans.filter((plan) => plan.id !== "team");
  const visibleCompareRows = featureFlags.showAdvancedPricingRows
    ? pricingCompareRows
    : pricingCompareRows;

  return (
    <PublicPageShell active="pricing" showAuthCta={false} mainClassName="pb-24">
      <div className="mb-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Predictable pricing for precise linting.
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-zinc-400">
          Choose a plan for repeatable caption QA across upload, lint, review, and export workflows.
        </p>
      </div>

      <div
        className={`mb-20 grid gap-4 ${
          featureFlags.showTeamPlan ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {visiblePlans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex flex-col overflow-hidden rounded-lg border p-6 ${
              plan.featured ? "border-[#22c55e4d] bg-[#201f20]" : "border-[#3d4a3d] bg-[#0e0e0f]"
            }`}
          >
            {plan.featured ? <div className="absolute inset-x-0 top-0 h-1 bg-[#22c55e]" /> : null}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-1 text-lg font-semibold">{plan.name}</h2>
                <p className="text-sm text-zinc-400">{plan.desc}</p>
              </div>
              {plan.featured ? (
                <span className="rounded border border-[#22c55e33] bg-[#22c55e1a] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#22c55e]">
                  Popular
                </span>
              ) : null}
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold">{plan.price}</span>
              <span className="font-mono text-sm text-zinc-400">{plan.period}</span>
            </div>
            <Button
              className={`mb-6 h-9 w-full text-[11px] uppercase tracking-wider ${
                plan.featured
                  ? "bg-[#22c55e] text-[#003915] hover:bg-[#4be277]"
                  : "border border-[#3d4a3d] bg-[#131314] text-zinc-100 hover:bg-[#201f20]"
              }`}
              variant={plan.featured ? "default" : "outline"}
            >
              {plan.cta}
            </Button>
            <div className="flex flex-1 flex-col gap-4">
              {plan.features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-2">
                  <span className={feature.muted ? "text-zinc-500" : "text-[#22c55e]"}>⧖</span>
                  <span className={`font-mono text-sm ${feature.muted ? "text-zinc-400" : "text-zinc-100"}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="mx-auto max-w-5xl">
        <h3 className="mb-4 text-lg font-semibold">Compare Features</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-[#35343680] px-4 py-2 text-[11px] uppercase tracking-wider text-zinc-400">
                  Feature
                </th>
                <th className="border-b border-[#35343680] px-4 py-2 text-center text-[11px] uppercase tracking-wider text-zinc-400">
                  Free
                </th>
                <th className="border-b border-[#35343680] px-4 py-2 text-center text-[11px] uppercase tracking-wider text-[#22c55e]">
                  Pro
                </th>
                {featureFlags.showTeamPlan ? (
                  <th className="border-b border-[#35343680] px-4 py-2 text-center text-[11px] uppercase tracking-wider text-zinc-400">
                    Team
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {visibleCompareRows.map((row) => (
                <tr key={row.feature} className="hover:bg-[#1c1b1c]">
                  <td className="border-b border-[#35343680] px-4 py-3 text-zinc-100">{row.feature}</td>
                  <td className="border-b border-[#35343680] px-4 py-3 text-center">
                    {row.free === "check" ? (
                      <CheckMark kind="gray" />
                    ) : row.free === "dash" ? (
                      <CheckMark kind="dash" />
                    ) : (
                      <span className="font-mono text-xs text-zinc-400">{row.free}</span>
                    )}
                  </td>
                  <td className="border-b border-[#35343680] px-4 py-3 text-center">
                    {row.pro === "check" ? (
                      <CheckMark kind="green" />
                    ) : row.pro === "dash" ? (
                      <CheckMark kind="dash" />
                    ) : (
                      <span className="font-mono text-xs text-[#22c55e]">{row.pro}</span>
                    )}
                  </td>
                  {featureFlags.showTeamPlan ? (
                    <td className="border-b border-[#35343680] px-4 py-3 text-center">
                      {row.team === "check" ? (
                        <CheckMark kind="gray" />
                      ) : row.team === "dash" ? (
                        <CheckMark kind="dash" />
                      ) : (
                        <span className="font-mono text-xs text-zinc-400">{row.team}</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PublicPageShell>
  );
}
