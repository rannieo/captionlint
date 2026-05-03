import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#0e0e0f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 md:flex-row">
        <span className="text-lg font-bold">CaptionLint</span>
        <span className="text-xs text-zinc-500">© 2024 CaptionLint. Built for technical accuracy.</span>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <Link href="/pricing" className="hover:text-[#22c55e]">
            Pricing
          </Link>
          <a href="#" className="hover:text-[#22c55e]">
            Terms
          </a>
          <a href="#" className="hover:text-[#22c55e]">
            Privacy
          </a>
          <a href="#" className="hover:text-[#22c55e]">
            Status
          </a>
        </div>
      </div>
    </footer>
  );
}
