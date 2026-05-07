"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { WorkspaceNav } from "./workspace-nav";
import { WorkspaceUserBadge } from "./workspace-user-badge";

export function MobileNavSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-8 place-items-center rounded text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[280px] flex-col border-r border-[#1F2937] bg-[#111112] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-3 px-6 pb-8 pt-5">
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
        </SheetContent>
      </Sheet>
    </>
  );
}
