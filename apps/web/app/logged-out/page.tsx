import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PublicPageShell } from "../_components/public-page-shell";

export const metadata: Metadata = {
  title: "CaptionLint | Logged Out",
  description: "You have been securely logged out of CaptionLint.",
};

export default function LoggedOutPage() {
  return (
    <PublicPageShell
      showAuthCta={false}
      showOpenAppLink={false}
      showFooter={false}
      mainClassName="flex min-h-[calc(100vh-8rem)] items-center justify-center pb-12"
    >
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="grid size-14 place-items-center rounded-xl border border-[#22C55E33] bg-[#0B1A0B]">
            <ShieldCheck className="size-7 text-[#22C55E]" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">
          Successfully logged out
        </h1>
        <p className="mb-6 text-sm text-zinc-400">Your session has ended securely.</p>

        {/* Session info card */}
        <Card className="mb-6 border border-[#1F2937] ring-0 text-left">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#22C55E]" />
              <div>
                <p className="mb-1 text-sm font-medium text-zinc-100">Local Session Cleared</p>
                <p className="text-xs text-zinc-400">
                  For your security, all temporary cache and local session data have been removed from this device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href="/sign-in"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#22C55E] text-sm font-medium text-[#003915] hover:bg-[#4BE277]"
          >
            Sign In Again
          </Link>
          <Link
            href="/"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#1F2937] text-sm font-medium text-zinc-300 hover:bg-[#1F2937]"
          >
            Return to Landing Page
          </Link>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex items-center justify-center gap-1 text-xs text-zinc-500">
          <Link href="/docs" className="hover:text-zinc-300">Documentation</Link>
          <span className="mx-2">·</span>
          <Link href="#" className="hover:text-zinc-300">Support</Link>
        </div>
      </div>
    </PublicPageShell>
  );
}
