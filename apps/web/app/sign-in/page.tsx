import type { Metadata } from "next";
import { PublicPageShell } from "../_components/public-page-shell";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "CaptionLint | Sign In",
  description: "Access your CaptionLint workspace.",
};

export default function SignInPage() {
  return (
    <PublicPageShell
      active="auth"
      showAuthCta={false}
      showOpenAppLink={false}
      showFooter={false}
      mainClassName="flex min-h-[calc(100vh-8rem)] items-center justify-center pb-12"
    >
      <SignInForm />
    </PublicPageShell>
  );
}
