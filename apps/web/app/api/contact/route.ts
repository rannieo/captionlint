import { Resend } from "resend";
import { NextResponse } from "next/server";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "hello@captionlint.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "CaptionLint <noreply@captionlint.com>";

// In-memory sliding-window rate limiter: 3 submissions per IP per hour.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ipTimestamps = new Map<string, number[]>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const prev = (ipTimestamps.get(ip) ?? []).filter((t) => t > windowStart);

  if (prev.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = prev[0] ?? now;
    const retryAfterSecs = Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000);
    ipTimestamps.set(ip, prev);
    return { allowed: false, retryAfterSecs };
  }

  ipTimestamps.set(ip, [...prev, now]);
  return { allowed: true, retryAfterSecs: 0 };
}

function getIp(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  if (forwarded) return (forwarded.split(",")[0] ?? forwarded).trim();
  return (request.headers as Headers).get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const { allowed, retryAfterSecs } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many submissions. Please wait ${Math.ceil(retryAfterSecs / 60)} minute(s) before trying again.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSecs) } },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, subject, message } = body as Record<string, unknown>;

  if (
    typeof name !== "string" || name.trim().length < 2 ||
    typeof email !== "string" || !email.includes("@") ||
    typeof subject !== "string" || subject.trim().length < 2 ||
    typeof message !== "string" || message.trim().length < 10
  ) {
    return NextResponse.json({ error: "All fields are required." }, { status: 422 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: email.trim(),
    subject: `[CaptionLint Contact] ${subject.trim()}`,
    text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    html: `
      <p><strong>Name:</strong> ${escHtml(name.trim())}</p>
      <p><strong>Email:</strong> ${escHtml(email.trim())}</p>
      <p><strong>Subject:</strong> ${escHtml(subject.trim())}</p>
      <hr />
      <p style="white-space:pre-wrap">${escHtml(message.trim())}</p>
    `,
  });

  if (error) {
    console.error("[contact] resend error", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
