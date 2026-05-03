"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, History, Settings, Tags, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/results", label: "Results", icon: Gauge },
  { href: "/history", label: "History", icon: History },
  { href: "/rulesets", label: "Rulesets", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Workspace">
      {navItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-2 border-l-transparent px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-100",
              isActive && "border-l-[#22C55E] bg-zinc-900 text-zinc-100"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
