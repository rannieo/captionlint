import { test, expect } from "@playwright/test";
import { HistoryPage } from "./pages/history-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Gap 4 — Demo badge on seed history entries", () => {
  test("shows Demo badge on every seed row in /history", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    const demoBadges = page.locator("[data-demo='true']");
    await expect(demoBadges.first()).toBeVisible();
    const count = await demoBadges.count();
    expect(count).toBe(4);
  });

  test("does not show Demo badge on a real localStorage run", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const realRun = {
        id: "run-real-001",
        file: "real-upload.srt",
        presets: ["TikTok"],
        date: "2026-01-01 12:00:00",
        autoFixed: 2,
        pending: 1,
        pendingLabel: "1 Pending Review",
        status: "fixed",
        downloadContent: "fixed",
        rawContent: "raw",
        format: "SRT",
      };
      localStorage.setItem("captionlint.historyRuns", JSON.stringify([realRun]));
    });

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    await historyPage.expectNoDemoBadgeOnRow("real-upload.srt");
  });

  test("real run appears before seed rows in DOM order", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const realRun = {
        id: "run-real-002",
        file: "first-real.srt",
        presets: ["Default"],
        date: "2026-01-01 12:00:00",
        autoFixed: 0,
        pending: 0,
        pendingLabel: "0 Violations Found",
        status: "clean",
        downloadContent: "fixed",
        rawContent: "raw",
        format: "SRT",
      };
      localStorage.setItem("captionlint.historyRuns", JSON.stringify([realRun]));
    });

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    await historyPage.expectFirstRowFilename("first-real.srt");
  });

  test("seed rows in /dashboard Recent Runs carry Demo badge", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector("table");
    const demoBadges = page.locator("[data-demo='true']");
    await expect(demoBadges.first()).toBeVisible();
  });
});
