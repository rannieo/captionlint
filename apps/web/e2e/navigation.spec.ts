import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// ─────────────────────────────────────────────────────────────────────────────
// Public pages
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Public pages — happy path", () => {
  test("home page loads without error", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Predictable pricing")).toBeVisible();
  });

  test("pricing page shows the Free plan card", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Free").first()).toBeVisible();
  });

  test("pricing feature rows list schedule/ruleset/seat features", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("100 min / mo").first()).toBeVisible();
    await expect(page.getByText("5 Rulesets").first()).toBeVisible();
  });

  test("pricing icons are rendered (no broken ⧖ placeholder)", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=⧖")).not.toBeVisible();
  });

  test("/terms page renders with 'Terms of Service' heading", async ({ page }) => {
    await page.goto("/terms");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /terms of service/i }).first(),
    ).toBeVisible();
  });

  test("/privacy page renders with 'Privacy Policy' heading", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /privacy policy/i }).first(),
    ).toBeVisible();
  });

  test("/sign-in page is reachable", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("/create-account page is reachable", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.getByRole("heading", { name: /create an account/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Footer navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Footer navigation", () => {
  test("footer Terms link navigates to /terms", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Terms" }).first().click();
    await expect(page).toHaveURL(/\/terms/);
  });

  test("footer Privacy link navigates to /privacy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Privacy" }).first().click();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test("footer Pricing link navigates to /pricing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Workspace pages — unauthenticated access
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Workspace pages — unauthenticated access", () => {
  test("/upload is accessible without auth and shows Run QA button", async ({ page }) => {
    await page.goto("/upload");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /run qa/i })).toBeVisible();
  });

  test("/history is accessible without auth and shows the table", async ({ page }) => {
    await page.goto("/history");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table")).toBeVisible();
  });

  test("/rulesets is accessible without auth and shows the table", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table")).toBeVisible();
  });

  test("/results shows demo data without auth", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    await expect(page.getByText("demo-captionlint.srt")).toBeVisible();
  });

  test("/dashboard shows sign-in prompt for guests", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Sign in to see your dashboard.")).toBeVisible();
  });

  test("/settings page is reachable", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/settings/);
  });
});
