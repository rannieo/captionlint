import type { Metadata } from "next";
import { PublicPageShell } from "../_components/public-page-shell";
import { CreateAccountForm } from "./create-account-form";

export const metadata: Metadata = {
  title: "CaptionLint | Create Account",
  description: "Create your CaptionLint account.",
};

export default function CreateAccountPage() {
  return (
    <PublicPageShell
      active="auth"
      showAuthCta={false}
      showOpenAppLink={false}
      showFooter={false}
      mainClassName="flex min-h-[calc(100vh-8rem)] items-center justify-center pb-12"
    >
      <CreateAccountForm />
    </PublicPageShell>
  );
}
