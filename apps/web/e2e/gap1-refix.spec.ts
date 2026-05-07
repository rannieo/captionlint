import { test, expect } from "@playwright/test";
import { UploadPage } from "./pages/upload-page";
import { HistoryPage } from "./pages/history-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Gap 1 — Re-fix without re-upload", () => {
  test("after lint run, localStorage historyRuns[0] has rawContent", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    await uploadPage.uploadFile("sample.srt");
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    const rawContent = await page.evaluate(() => {
      const raw = localStorage.getItem("captionlint.historyRuns");
      if (!raw) return null;
      const runs = JSON.parse(raw);
      return runs[0]?.rawContent ?? null;
    });

    expect(rawContent).not.toBeNull();
    expect(typeof rawContent).toBe("string");
    expect(rawContent.length).toBeGreaterThan(0);
  });

  test("↺ button navigates to /upload/runs/<id> for browser runs", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    await uploadPage.uploadFile("sample.srt");
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await historyPage.clickReRunForFile("sample.srt");
    await page.waitForURL(/\/upload\/runs\//);
  });

  test("/upload/runs/<id> shows re-fix card with filename, no file picker", async ({ page }) => {
    await page.goto("/");
    const runId = "run-refix-test";
    await page.evaluate((id) => {
      const run = {
        id,
        file: "my-captions.srt",
        presets: ["TikTok"],
        date: "2026-01-01 00:00:00",
        autoFixed: 2,
        pending: 0,
        pendingLabel: "0 Violations Found",
        status: "fixed",
        downloadContent: "fixed content",
        rawContent: "1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:03,500 --> 00:00:05,000\nSecond cue.",
        format: "SRT",
      };
      localStorage.setItem("captionlint.historyRuns", JSON.stringify([run]));
    }, runId);

    const uploadPage = new UploadPage(page);
    await uploadPage.goto({ runId });
    await uploadPage.expectReFicModeVisible();

    await expect(page.getByText("my-captions.srt").first()).toBeVisible();
    await expect(page.locator("input[type='file']")).not.toBeVisible();
  });

  test("clicking Run QA in re-fix mode navigates to /results", async ({ page }) => {
    await page.goto("/");
    const runId = "run-refix-nav";
    await page.evaluate((id) => {
      const run = {
        id,
        file: "refix-test.srt",
        presets: ["Default"],
        date: "2026-01-01 00:00:00",
        autoFixed: 0,
        pending: 0,
        pendingLabel: "0 Violations Found",
        status: "clean",
        downloadContent: "x",
        rawContent: "1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:03,500 --> 00:00:05,000\nSecond cue.",
        format: "SRT",
      };
      localStorage.setItem("captionlint.historyRuns", JSON.stringify([run]));
    }, runId);

    const uploadPage = new UploadPage(page);
    await uploadPage.goto({ runId });
    await uploadPage.expectReFicModeVisible();
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    await page.waitForTimeout(300);
    await expect(page.getByText("refix-test.srt").first()).toBeVisible();
  });

  test("re-fix adds a new history entry", async ({ page }) => {
    await page.goto("/");
    const runId = "run-refix-history";
    await page.evaluate((id) => {
      const run = {
        id,
        file: "original.srt",
        presets: ["TikTok"],
        date: "2026-01-01 00:00:00",
        autoFixed: 0,
        pending: 0,
        pendingLabel: "0 Violations Found",
        status: "clean",
        downloadContent: "x",
        rawContent: "1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:03,500 --> 00:00:05,000\nSecond cue.",
        format: "SRT",
      };
      localStorage.setItem("captionlint.historyRuns", JSON.stringify([run]));
    }, runId);

    const uploadPage = new UploadPage(page);
    await uploadPage.goto({ runId });
    await uploadPage.expectReFicModeVisible();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Instagram" }).click();
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    const historyCount = await page.evaluate(() => {
      const raw = localStorage.getItem("captionlint.historyRuns");
      return raw ? JSON.parse(raw).length : 0;
    });
    expect(historyCount).toBe(2);
  });
});
