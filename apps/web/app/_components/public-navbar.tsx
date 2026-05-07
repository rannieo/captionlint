import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PublicNavProps = {
  active?: "product" | "features" | "pricing" | "auth";
  showAuthCta?: boolean;
  showOpenAppLink?: boolean;
};

const items = [
  { key: "product", label: "Product", href: "/" },
  { key: "features", label: "Features", href: "/features" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
] as const;

export function PublicNavbar({ active, showAuthCta = true, showOpenAppLink = !showAuthCta }: PublicNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1F2937] bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="CaptionLint" width={32} height={32} className="rounded" />
          <span className="text-xl font-bold tracking-tight">CaptionLint</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-zinc-100",
                active === item.key ? "font-semibold text-zinc-100 opacity-90" : "text-zinc-400"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {showAuthCta ? (
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm text-zinc-400 transition-colors hover:text-zinc-100 md:block"
            >
              Log In
            </Link>
            <Link
              href="/create-account"
              className="inline-flex items-center gap-2 rounded bg-[#22C55E] px-4 py-2 text-sm font-medium text-[#003915] transition-colors hover:bg-[#4BE277]"
            >
              Get Started <span>→</span>
            </Link>
          </div>
        ) : showOpenAppLink ? (
          <Link href="/upload" className="text-sm font-medium text-[#22c55e] hover:text-[#4be277]">
            Open App
          </Link>
        ) : (
          <div className="w-16" />
        )}
      </div>
    </header>
  );
}
