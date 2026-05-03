import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicPageShell } from "../_components/public-page-shell";

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
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold tracking-tight">CaptionLint</p>
        </div>

        <Card className="border-[#3d4a3d] bg-[#111112]">
          <CardHeader className="text-center">
            <CardTitle>Create an account</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your details to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="border-[#353436] bg-[#18181B]">
                Continue with GitHub
              </Button>
              <Button variant="outline" className="border-[#353436] bg-[#18181B]">
                Continue with Google
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <div className="h-px flex-1 bg-[#353436]" />
              <span>Or use email</span>
              <div className="h-px flex-1 bg-[#353436]" />
            </div>

            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm text-zinc-400">
                Full Name
              </label>
              <Input
                id="full-name"
                placeholder="Jane Doe"
                className="border-[#353436] bg-[#0A0A0B]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-400">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                className="border-[#353436] bg-[#0A0A0B]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-zinc-400">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="border-[#353436] bg-[#0A0A0B]"
              />
            </div>

            <Button className="h-10 w-full bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]">
              Create Account
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#22C55E] hover:text-[#4BE277]">
            Sign in
          </Link>
        </p>
      </div>
    </PublicPageShell>
  );
}
