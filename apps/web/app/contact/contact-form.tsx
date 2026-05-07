"use client";

import { FormEvent, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "sending" | "success" | "error" | "rate-limited";

export function ContactForm() {
  const posthog = usePostHog();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function validate(): string | null {
    if (name.trim().length < 2) return "Enter your full name.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (subject.trim().length < 2) return "Enter a subject.";
    if (message.trim().length < 10) return "Message must be at least 10 characters.";
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      posthog.capture("contact_form_validation_failed", { error: validationError });
      setErrorMsg(validationError);
      setStatus("error");
      return;
    }

    posthog.capture("contact_form_submitted", { subject: subject.trim() });
    setStatus("sending");
    setErrorMsg("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
    });

    if (res.ok) {
      posthog.capture("contact_form_success");
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      const data = await res.json().catch(() => ({}));
      const msg = (data as { error?: string }).error ?? "Something went wrong. Please try again.";
      setErrorMsg(msg);
      if (res.status === 429) {
        posthog.capture("contact_form_rate_limited");
        setStatus("rate-limited");
      } else {
        posthog.capture("contact_form_error", { status: res.status, error: msg });
        setStatus("error");
      }
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-[#22c55e33] bg-[#22c55e0f] px-8 py-12 text-center">
        <svg className="size-10 text-[#22c55e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-lg font-semibold text-zinc-100">Message sent!</p>
        <p className="text-sm text-zinc-400">We'll get back to you at <span className="text-zinc-200">{email || "your address"}</span> as soon as we can.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 border-[#1F2937] bg-[#111827] text-zinc-300"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Full Name
          </label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="border-[#1F2937] bg-[#0B0F14]"
            autoComplete="name"
            disabled={status === "sending"}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Email Address
          </label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="border-[#1F2937] bg-[#0B0F14]"
            autoComplete="email"
            disabled={status === "sending"}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Subject
        </label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="General inquiry, billing, feature request…"
          className="border-[#1F2937] bg-[#0B0F14]"
          disabled={status === "sending"}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind…"
          disabled={status === "sending"}
          className="w-full resize-none rounded-md border border-[#1F2937] bg-[#0B0F14] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#22c55e] disabled:opacity-50"
        />
      </div>

      {(status === "error" || status === "rate-limited") && errorMsg ? (
        <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
          status === "rate-limited"
            ? "border-[#78350f] bg-[#451a03] text-[#fde68a]"
            : "border-[#7f1d1d] bg-[#450a0a] text-[#fecaca]"
        }`}>
          <svg className="mt-0.5 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {errorMsg}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-10 px-6 bg-[#22C55E] text-[#003915] hover:bg-[#4BE277] disabled:opacity-50"
          disabled={status === "sending" || status === "rate-limited"}
        >
          {status === "sending" ? "Sending…" : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
