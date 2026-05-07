import type { Metadata } from "next";
import { PublicPageShell } from "../_components/public-page-shell";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "CaptionLint | Contact",
  description: "Get in touch with the CaptionLint team for general inquiries, billing, or feature requests.",
};

export default function ContactPage() {
  return (
    <PublicPageShell active={undefined} showAuthCta={false} mainClassName="pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Contact Us</h1>
          <p className="text-sm text-zinc-400">
            Have a question, found a bug, or want to share feedback? Fill out the form below and
            we'll get back to you as soon as we can.
          </p>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-6 md:p-8">
          <ContactForm />
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-lg border border-[#1F2937] bg-[#0B0F14] p-6 text-sm text-zinc-400 sm:flex-row sm:gap-8">
          <div>
            <p className="mb-1 font-semibold text-zinc-300">General inquiries</p>
            <a href="mailto:hello@captionlint.com" className="hover:text-[#22c55e]">
              hello@captionlint.com
            </a>
          </div>
          <div>
            <p className="mb-1 font-semibold text-zinc-300">Privacy &amp; data</p>
            <a href="mailto:privacy@captionlint.com" className="hover:text-[#22c55e]">
              privacy@captionlint.com
            </a>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
