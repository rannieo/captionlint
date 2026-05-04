import Link from "next/link";
import { cn } from "@/lib/utils";

const docsLinks = [
  { href: "/docs", label: "Introduction", slug: "intro" },
  { href: "/docs/quick-start", label: "Quick Start", slug: "quick-start" },
  { href: "/docs/configuration", label: "Configuration", slug: "configuration" },
  { href: "/docs/workflow-memory", label: "Workflow Memory", slug: "workflow-memory" },
  { href: "/docs/linter-rules", label: "Linter Rules", slug: "linter-rules" },
  { href: "/docs/integrations", label: "Integrations", slug: "integrations" },
] as const;

type DocsSidebarProps = {
  active: "intro" | "quick-start" | "configuration" | "workflow-memory" | "linter-rules" | "integrations";
};

export function DocsSidebar({ active }: DocsSidebarProps) {
  return (
    <aside className="top-24 h-fit rounded-lg border border-[#1E293B] bg-[#111112] p-4 md:sticky">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
        Documentation
      </h2>
      <nav className="flex flex-col gap-1">
        {docsLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              active === item.slug
                ? "bg-[#18181B] text-[#22C55E]"
                : "text-zinc-400 hover:bg-[#18181B] hover:text-zinc-100"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
