import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { WorkspaceNav } from "./workspace-nav";

type WorkspaceShellProps = {
  children: React.ReactNode;
};

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-[#1F2937] bg-[#111112] py-4 md:flex">
        <div className="flex items-center gap-3 px-6 pb-8 pt-1">
          <Image src="/logo.png" alt="CaptionLint" width={32} height={32} className="rounded" />
          <div>
            <strong className="block text-lg font-bold tracking-tight text-[#22C55E]">
              CaptionLint
            </strong>
            <p className="font-mono text-[10px] text-zinc-500">v1.2-stable</p>
          </div>
        </div>
        <WorkspaceNav />
        <div className="mt-auto border-t border-[#1F2937]">
          <div className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-900/70">
            <div className="grid size-8 place-items-center rounded-full border border-[#1F2937] bg-zinc-800 text-[11px] font-semibold text-zinc-300">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-100">System Admin</p>
              <p className="text-xs text-zinc-500">Admin User</p>
            </div>
            <Link
              href="/logged-out"
              title="Sign out"
              className="grid size-7 place-items-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-[#EF4444]"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen flex-col md:ml-[280px]">{children}</div>
    </div>
  );
}
