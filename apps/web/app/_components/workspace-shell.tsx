import Image from "next/image";
import Link from "next/link";
import { WorkspaceNav } from "./workspace-nav";
import { WorkspaceUserBadge } from "./workspace-user-badge";

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
          <WorkspaceUserBadge />
        </div>
      </aside>
      <div className="flex min-h-screen flex-col md:ml-[280px]">{children}</div>
    </div>
  );
}
