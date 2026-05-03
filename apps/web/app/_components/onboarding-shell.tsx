import Link from "next/link";
import { cn } from "@/lib/utils";

const setupSteps = [
  { href: "/onboarding/workspace-setup", label: "Workspace Setup", id: "workspace" },
  { href: "/onboarding/ruleset", label: "Ruleset Config", id: "ruleset" },
  { href: "/onboarding/team", label: "Team Members", id: "team" },
  { href: "/onboarding/success", label: "Review", id: "success" },
] as const;

type OnboardingShellProps = {
  children: React.ReactNode;
  active: "workspace" | "ruleset" | "team" | "success";
};

export function OnboardingShell({ children, active }: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#1E293B] bg-[#111112] md:flex">
        <div className="border-b border-[#1E293B] px-4 py-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded border border-[#22C55E]/20 bg-[#22C55E]/10 font-mono text-xs font-bold text-[#22C55E]">
              CL
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Project Setup</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">Onboarding Flow</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4">
          {setupSteps.map((step) => {
            const isActive = step.id === active;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={cn(
                  "mb-1 flex items-center rounded px-3 py-3 text-xs font-medium uppercase tracking-widest transition-colors",
                  isActive
                    ? "border-r-2 border-r-[#22C55E] bg-[#18181B] text-[#22C55E]"
                    : "text-zinc-400 hover:bg-[#18181B] hover:text-zinc-100"
                )}
              >
                {step.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#1E293B] p-4">
          <Link
            href="/docs"
            className="mb-2 block rounded px-3 py-2 text-xs uppercase tracking-widest text-zinc-400 hover:bg-[#18181B] hover:text-zinc-100"
          >
            Docs
          </Link>
          <button
            type="button"
            className="w-full rounded border border-[#1E293B] bg-[#18181B] px-3 py-2 text-xs uppercase tracking-widest text-zinc-200"
          >
            Save Draft
          </button>
        </div>
      </aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1E293B] bg-[#0A0A0B] px-6">
          <div className="font-mono text-lg font-black tracking-tight text-[#22C55E]">CaptionLint</div>
          <div className="size-8 rounded border border-[#1E293B] bg-[#18181B]" />
        </header>
        {children}
      </div>
    </div>
  );
}
