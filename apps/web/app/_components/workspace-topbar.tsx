import { Button } from "@/components/ui/button";

type WorkspaceTopbarProps = {
  left: React.ReactNode;
  shareLabel?: string;
  exportLabel?: string;
  rightSlot?: React.ReactNode;
};

export function WorkspaceTopbar({
  left,
  shareLabel = "Share",
  exportLabel = "Export",
  rightSlot,
}: WorkspaceTopbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-12 items-center justify-between border-b border-[#1F2937] bg-[#111112] px-4 md:left-[280px]">
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">
        {rightSlot}
        <Button size="sm" variant="outline" className="h-7 border-[#1F2937] bg-zinc-900">
          {shareLabel}
        </Button>
        <Button size="sm" className="h-7 bg-[#22C55E] text-[#0A0A0B] hover:bg-[#4BE277]">
          {exportLabel}
        </Button>
      </div>
    </header>
  );
}
