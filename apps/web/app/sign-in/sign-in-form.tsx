"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): string | null {
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

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => router.push("/dashboard"),
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
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your details below to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-400">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="border-[#1F2937] bg-[#0B0F14]"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm text-zinc-400">
                  Password
                </label>
                <Link href="#" className="text-xs text-[#22C55E] hover:text-[#4BE277]">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="border-[#1F2937] bg-[#0B0F14]"
                autoComplete="current-password"
              />
            </div>

            {error ? <p className="text-xs text-[#ef4444]">{error}</p> : null}

            <Button className="h-10 w-full bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-[#1F2937]" />
            <span>Or continue with</span>
            <div className="h-px flex-1 bg-[#1F2937]" />
          </div>

          <div className="grid gap-2">
            <Button variant="outline" className="border-[#1F2937] bg-[#111827]" onClick={() => router.push("/dashboard")}>
              Sign in with GitHub
            </Button>
            <Button variant="outline" className="border-[#1F2937] bg-[#111827]" onClick={() => router.push("/dashboard")}>
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/create-account" className="text-[#22C55E] hover:text-[#4BE277]">
          Create one
        </Link>
      </p>
    </div>
  );
}
