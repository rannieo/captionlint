"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function WorkspaceUserBadge() {
  const { data: session } = authClient.useSession();

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase() || "??";

  const image = session?.user?.image ?? "";

  return (
    <div className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-900/70">
      <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-[#1F2937] bg-zinc-800 text-[11px] font-semibold text-zinc-300">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="size-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-zinc-100">{name || "—"}</p>
        <p className="truncate text-xs text-zinc-500">{email}</p>
      </div>
      <Link
        href="/logged-out"
        title="Sign out"
        className="grid size-7 shrink-0 place-items-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-[#EF4444]"
      >
        <LogOut className="size-4" />
      </Link>
    </div>
  );
}
