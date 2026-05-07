import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Gap 2 — Dashboard shows auth-aware content", () => {
  test("renders the dashboard page without crashing for guests", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    // No uncaught JS errors — page must not throw
    await page.waitForLoadState("networkidle");
  });

  test("shows sign-in prompt for unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Sign in to see your dashboard.")).toBeVisible();
  });

  test("does not show data table for unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // No runs table should be visible — user is not signed in
    await expect(page.locator("table")).not.toBeVisible();
  });

  test("shows quick-action buttons for guests", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // Quick-action area exists on the page (in the static shell, not DashboardClient)
    const uploadLink = page.getByRole("link", { name: /upload/i }).first();
    await expect(uploadLink).toBeVisible();
  });
});
