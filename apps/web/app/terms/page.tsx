import type { Metadata } from "next";
import { PublicPageShell } from "../_components/public-page-shell";

export const metadata: Metadata = {
  title: "CaptionLint | Terms of Service",
  description: "Terms of Service for CaptionLint — the caption QA workflow tool.",
};

const LAST_UPDATED = "May 7, 2026";

export default function TermsPage() {
  return (
    <PublicPageShell showAuthCta={false} mainClassName="pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Legal</p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-zinc-400">
          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using CaptionLint ("the Service"), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, do not use the Service. These terms apply to all
              users, including visitors, registered users, and those who access the Service through
              third-party integrations.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              2. Description of Service
            </h2>
            <p>
              CaptionLint is a caption quality assurance tool that allows users to upload subtitle and
              caption files (SRT, VTT), run deterministic lint checks against configurable presets, and
              export corrected files. The Service is provided on an "as is" basis and is subject to change
              at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              3. Account Registration
            </h2>
            <p>
              You may use certain features of the Service without registering an account. To access
              persistent history, custom rulesets, and API-backed workflows, you must create an account
              using a valid email address or an OAuth provider (GitHub or Google). You are responsible for
              maintaining the security of your account credentials and for all activity that occurs under
              your account. You must be at least 16 years old to create an account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              4. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-3 space-y-2 pl-5">
              {[
                "Upload files that contain malicious code or are designed to harm the Service or other users.",
                "Attempt to reverse-engineer, decompile, or extract proprietary algorithms from the Service.",
                "Use automated scripts or bots to exceed reasonable API rate limits.",
                "Resell or sublicense access to the Service without written permission.",
                "Impersonate any person or entity or misrepresent your affiliation with any person or entity.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 text-[#22c55e]">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              5. Intellectual Property
            </h2>
            <p>
              All content, software, and technology underlying the Service — including the lint engine,
              preset configurations, and user interface — are the intellectual property of CaptionLint and
              its licensors. You retain ownership of all caption files you upload. By uploading files, you
              grant CaptionLint a limited, non-exclusive license to process those files solely for the
              purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              6. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, express or
              implied, including but not limited to warranties of merchantability, fitness for a particular
              purpose, or non-infringement. CaptionLint does not warrant that the Service will be
              uninterrupted, error-free, or produce results that meet your specific quality standards.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, CaptionLint and its affiliates shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages arising
              from your use of or inability to use the Service, even if advised of the possibility of such
              damages. Our total liability for any claims arising under these terms shall not exceed the
              amount you paid for the Service in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify registered
              users of material changes via email or an in-app notice. Your continued use of the Service
              after changes become effective constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 border-b border-[#353436] pb-3 text-lg font-semibold text-zinc-100">
              9. Contact
            </h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
              <a
                href="mailto:hello@captionlint.com"
                className="text-[#22c55e] hover:text-[#4be277]"
              >
                hello@captionlint.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </PublicPageShell>
  );
}
