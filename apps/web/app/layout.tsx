import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "./_components/posthog-provider";

export const metadata: Metadata = {
  title: "CaptionLint",
  description:
    "QA for captions you already have. Upload captions, run deterministic checks, and export cleaner files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans")}>
      <body>
        <PostHogProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
