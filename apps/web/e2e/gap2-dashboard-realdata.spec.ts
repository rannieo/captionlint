import { test, expect } from "@playwright/test";
import { UploadPage } from "./pages/upload-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Gap 2 — Dashboard shows live localStorage runs", () => {
  test("shows 4 seed rows when localStorage is empty", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector("table");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);
  });

  test("shows real run as first row after a completed lint upload", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    await uploadPage.uploadFile("sample.srt");
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    await page.goto("/dashboard");
    await page.waitForSelector("table");

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toContainText("sample.srt");
    await expect(firstRow.locator("[data-demo='true']")).not.toBeVisible();
  });

  test("deduplicates if run id matches a seed id", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const override = {
        id: "run-001",
        file: "campaign_v3_final.srt",
        presets: ["YouTube Shorts"],
        date: "2026-01-01 00:00:00",
        autoFixed: 0,
        pending: 0,
        pendingLabel: "0 Violations Found",
        status: "clean",
        downloadContent: "x",
        rawContent: "raw",
        format: "SRT",
      };
      localStorage.setItem("captionlint.historyRuns", JSON.stringify([override]));
    });

    await page.goto("/dashboard");
    await page.waitForSelector("table");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);
  });
});
