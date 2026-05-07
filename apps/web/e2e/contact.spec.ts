import { test, expect, type Page } from "@playwright/test";

const VALID = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "General inquiry",
  message: "Hello, I have a question about CaptionLint and would love to learn more.",
};

async function fillForm(page: Page, overrides: Partial<typeof VALID> = {}) {
  const data = { ...VALID, ...overrides };
  await page.locator("#contact-name").fill(data.name);
  await page.locator("#contact-email").fill(data.email);
  await page.locator("#contact-subject").fill(data.subject);
  await page.locator("#contact-message").fill(data.message);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/contact");
});

// ─────────────────────────────────────────────────────────────────────────────
// Page structure
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Contact page — structure", () => {
  test("page loads with 'Contact Us' heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /contact us/i })).toBeVisible();
  });

  test("all four form fields are present", async ({ page }) => {
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-subject")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
  });

  test("Send Message button is present and enabled", async ({ page }) => {
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeEnabled();
  });

  test("contact email links are visible in the info block", async ({ page }) => {
    await expect(page.getByRole("link", { name: "hello@captionlint.com" })).toBeVisible();
    await expect(page.getByRole("link", { name: "privacy@captionlint.com" })).toBeVisible();
  });

  test("footer Contact link navigates to /contact", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Contact" }).first().click();
    await expect(page).toHaveURL(/\/contact/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Client-side validation (negative path — no API call needed)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Contact form — client-side validation", () => {
  test("submitting empty form shows name validation error", async ({ page }) => {
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
  });

  test("single-character name shows validation error", async ({ page }) => {
    await page.locator("#contact-name").fill("A");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
  });

  test("email without @ shows validation error", async ({ page }) => {
    await fillForm(page, { email: "notanemail" });
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("blank subject shows validation error", async ({ page }) => {
    await fillForm(page, { subject: "x" });
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Enter a subject.")).toBeVisible();
  });

  test("message shorter than 10 chars shows validation error", async ({ page }) => {
    await fillForm(page, { message: "too short" });
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/message must be at least 10/i)).toBeVisible();
  });

  test("validation error does not appear before the first submit attempt", async ({ page }) => {
    await expect(page.getByText("Enter your full name.")).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy path — mocked API success
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Contact form — happy path", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
    );
  });

  test("valid submission shows success state", async ({ page }) => {
    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Message sent!")).toBeVisible();
  });

  test("success state shows sender email address", async ({ page }) => {
    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(VALID.email)).toBeVisible();
  });

  test("form fields are cleared after successful submission", async ({ page }) => {
    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Message sent!")).toBeVisible();
    // Fields should be gone (success replaces form)
    await expect(page.locator("#contact-name")).not.toBeVisible();
  });

  test("'Send another message' button brings the form back", async ({ page }) => {
    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Message sent!")).toBeVisible();

    await page.getByRole("button", { name: /send another message/i }).click();
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("button shows 'Sending…' while request is in flight", async ({ page }) => {
    // Delay the mock response so we can observe the loading state
    await page.route("/api/contact", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await fillForm(page);
    const sendBtn = page.getByRole("button", { name: /sending/i });
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toBeDisabled();
  });

  test("all form fields are disabled while sending", async ({ page }) => {
    await page.route("/api/contact", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.locator("#contact-name")).toBeDisabled();
    await expect(page.locator("#contact-email")).toBeDisabled();
    await expect(page.locator("#contact-subject")).toBeDisabled();
    await expect(page.locator("#contact-message")).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Server error states — mocked API failures
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Contact form — server error states", () => {
  test("502 response shows generic error message", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: '{"error":"Failed to send message. Please try again."}',
      }),
    );

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/failed to send message/i)).toBeVisible();
  });

  test("error state re-enables the Submit button after failure", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: '{"error":"Failed to send message. Please try again."}',
      }),
    );

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/failed to send message/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeEnabled();
  });

  test("422 unprocessable shows server validation message", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({
        status: 422,
        contentType: "application/json",
        body: '{"error":"All fields are required."}',
      }),
    );

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("All fields are required.")).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting — mocked 429 response
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Contact form — rate limiting", () => {
  test("429 response shows rate-limit warning message", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: '{"error":"Too many submissions. Please wait 60 minute(s) before trying again."}',
        headers: { "Retry-After": "3600" },
      }),
    );

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/too many submissions/i)).toBeVisible();
  });

  test("429 response shows amber warning (not red error) banner", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: '{"error":"Too many submissions. Please wait 60 minute(s) before trying again."}',
      }),
    );

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    // Amber banner uses bg-[#451a03] class; red uses bg-[#450a0a]
    const banner = page.locator(".bg-\\[\\#451a03\\]");
    await expect(banner).toBeVisible();
  });

  test("after 429 the Send Message button stays disabled", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: '{"error":"Too many submissions. Please wait 60 minute(s) before trying again."}',
      }),
    );

    await fillForm(page);
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/too many submissions/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeDisabled();
  });
});
