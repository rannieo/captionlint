import { cn } from "@/lib/utils";
import { PublicFooter } from "./public-footer";
import { PublicNavbar } from "./public-navbar";

type PublicPageShellProps = {
  children: React.ReactNode;
  active?: "product" | "features" | "pricing" | "auth";
  showAuthCta?: boolean;
  showOpenAppLink?: boolean;
  showFooter?: boolean;
  mainClassName?: string;
  pageClassName?: string;
};

export function PublicPageShell({
  children,
  active,
  showAuthCta = true,
  showOpenAppLink,
  showFooter = true,
  mainClassName,
  pageClassName,
}: PublicPageShellProps) {
  return (
    <div className={cn("min-h-screen bg-[#0B0F14] text-zinc-100", pageClassName)}>
      <PublicNavbar active={active} showAuthCta={showAuthCta} showOpenAppLink={showOpenAppLink} />
      <main className={cn("mx-auto w-full max-w-6xl px-6 pt-32", mainClassName)}>{children}</main>
      {showFooter ? <PublicFooter /> : null}
    </div>
  );
}
