import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-[#1F2937] bg-[#0B0F14]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 md:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="CaptionLint" width={28} height={28} />
          <span className="text-lg font-bold">CaptionLint</span>
        </div>
        <span className="text-xs text-zinc-500">© {year} CaptionLint. QA for captions you already have.</span>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <Link href="/pricing" className="hover:text-[#22c55e]">
            Pricing
          </Link>
          <Link href="/terms" className="hover:text-[#22c55e]">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#22c55e]">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
