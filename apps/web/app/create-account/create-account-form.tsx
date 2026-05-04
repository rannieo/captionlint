"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CreateAccountForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/upload");
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
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
          <div className="grid gap-2">
            <Button variant="outline" className="border-[#1F2937] bg-[#111827]" onClick={() => router.push("/upload")}>
              Continue with GitHub
            </Button>
            <Button variant="outline" className="border-[#1F2937] bg-[#111827]" onClick={() => router.push("/upload")}>
              Continue with Google
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-[#1F2937]" />
            <span>Or use email</span>
            <div className="h-px flex-1 bg-[#1F2937]" />
          </div>

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
