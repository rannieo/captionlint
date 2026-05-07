"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function CreateAccountForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);

  async function handleOAuth(provider: "github" | "google") {
    setOauthLoading(provider);
    await authClient.signIn.social({ provider, callbackURL: `${window.location.origin}/dashboard` });
  }

  function validateForm(): string | null {
    if (fullName.trim().length < 2) {
      return "Enter your full name.";
    }
    if (!email.includes("@")) {
      return "Enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    await authClient.signUp.email(
      { email, password, name: fullName.trim() },
      {
        onSuccess: (ctx) => {
          posthog.identify(ctx.data.user.id, { email: ctx.data.user.email, name: ctx.data.user.name });
          posthog.capture("user_signed_up", { method: "email" });
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsSubmitting(false);
        },
      },
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="CaptionLint" width={48} height={48} className="rounded-xl" />
        <p className="text-2xl font-bold tracking-tight">CaptionLint</p>
      </div>

      <Card className="border-[#1F2937] bg-[#111827]">
        <CardHeader className="text-center">
          <CardTitle>Create an account</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm text-zinc-400">
                Full Name
              </label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
                className="border-[#1F2937] bg-[#0B0F14]"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-400">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                className="border-[#1F2937] bg-[#0B0F14]"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-zinc-400">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a strong password"
                className="border-[#1F2937] bg-[#0B0F14]"
                autoComplete="new-password"
              />
            </div>

            {error ? <p className="text-xs text-[#ef4444]">{error}</p> : null}

            <Button className="h-10 w-full bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-[#1F2937]" />
            <span>Or continue with</span>
            <div className="h-px flex-1 bg-[#1F2937]" />
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              className="border-[#1F2937] bg-[#111827] gap-2"
              onClick={() => handleOAuth("github")}
              disabled={oauthLoading !== null || isSubmitting}
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              {oauthLoading === "github" ? "Redirecting…" : "Continue with GitHub"}
            </Button>
            <Button
              variant="outline"
              className="border-[#1F2937] bg-[#111827] gap-2"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null || isSubmitting}
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
              </svg>
              {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#22C55E] hover:text-[#4BE277]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
