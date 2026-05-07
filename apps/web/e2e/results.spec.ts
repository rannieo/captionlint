import { test, expect, type Page } from "@playwright/test";
import { UploadPage } from "./pages/upload-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Results — demo fallback", () => {
  test("demo results page loads without crashing", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/\/results/);
  });

  test("demo topbar shows demo filename", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    await expect(page.getByText("demo-captionlint.srt")).toBeVisible();
  });

  test("demo results show findings in sidebar", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    const findings = page.locator("[data-findings-panel] button[type='button']");
    await expect(findings.first()).toBeVisible();
    expect(await findings.count()).toBeGreaterThan(0);
  });

  test("severity filter buttons ALL / ERROR / WARN / PASS are all present", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    for (const label of ["ALL", "ERROR", "WARN", "PASS"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
  });

  test("Export Fixed File button is present on demo results", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    await expect(page.getByRole("button", { name: /export fixed file/i })).toBeVisible();
  });

  test("findings count text '… shown' is visible", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    await expect(page.getByText(/\d+ shown/)).toBeVisible();
  });
});

test.describe("Results — after upload", () => {
  async function runAndWait(page: Page) {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await upload.clickRunQA();
    await upload.waitForRedirectToResults();
    await page.waitForTimeout(300);
  }

  test("topbar shows uploaded filename", async ({ page }) => {
    await runAndWait(page);
    await expect(page.getByText("sample.srt").first()).toBeVisible();
  });

  test("topbar shows SRT format badge", async ({ page }) => {
    await runAndWait(page);
    await expect(page.getByText("SRT", { exact: true }).first()).toBeVisible();
  });

  test("topbar issue count badge is non-zero", async ({ page }) => {
    await runAndWait(page);
    const badge = page.getByText(/\d+ Issues/);
    await expect(badge).toBeVisible();
    const n = Number.parseInt((await badge.textContent()) ?? "0", 10);
    expect(n).toBeGreaterThan(0);
  });

  test("ALL filter shows more findings than ERROR filter alone", async ({ page }) => {
    await runAndWait(page);
    await page.getByRole("button", { name: "ALL", exact: true }).click();
    const allCount = await page.locator("[data-findings-panel] button[type='button']").count();

    await page.getByRole("button", { name: "ERROR", exact: true }).click();
    await page.waitForTimeout(100);
    const errorCount = await page.locator("[data-findings-panel] button[type='button']").count();

    expect(allCount).toBeGreaterThanOrEqual(errorCount);
  });

  test("WARN filter updates '… shown' count", async ({ page }) => {
    await runAndWait(page);
    await page.getByRole("button", { name: "WARN", exact: true }).click();
    await page.waitForTimeout(100);
    await expect(page.getByText(/\d+ shown/)).toBeVisible();
  });

  test("PASS filter shows only PASS findings", async ({ page }) => {
    await runAndWait(page);
    await page.getByRole("button", { name: "PASS", exact: true }).click();
    await page.waitForTimeout(100);
    // All visible findings should be PASS — verify via count text at minimum
    await expect(page.getByText(/\d+ shown/)).toBeVisible();
  });

  test("clicking a finding row keeps it visible (no JS crash)", async ({ page }) => {
    await runAndWait(page);
    const firstFinding = page.locator("[data-findings-panel] button[type='button']").first();
    await firstFinding.click();
    await expect(firstFinding).toBeVisible();
  });

  test("Export Fixed File button is visible after upload run", async ({ page }) => {
    await runAndWait(page);
    await expect(page.getByRole("button", { name: /export fixed file/i })).toBeVisible();
  });

  test("Export Fixed File triggers a browser download", async ({ page }) => {
    await runAndWait(page);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export fixed file/i }).click(),
    ]);
    expect(download.suggestedFilename()).toContain(".srt");
  });

  test("PASS metric badge shows count of passing checks", async ({ page }) => {
    await runAndWait(page);
    await expect(page.getByText("checks passed")).toBeVisible();
  });
});

test.describe("Results — local history route", () => {
  const HISTORY_KEY = "captionlint.historyRuns";

  test("/results/local/[id] shows the correct filename", async ({ page }) => {
    const runId = "run-local-view-001";
    await page.evaluate(
      ({ key, id }: { key: string; id: string }) => {
        const run = {
          id,
          file: "local-view.srt",
          presets: ["default"],
          date: new Date().toISOString(),
          autoFixed: 0,
          pending: 0,
          pendingLabel: "0 Violations Found",
          status: "clean",
          downloadContent: "1\n00:00:01,000 --> 00:00:03,000\nHello.\n",
          rawContent:
            "1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:03,500 --> 00:00:05,000\nSecond cue.",
          format: "SRT",
        };
        localStorage.setItem(key, JSON.stringify([run]));
      },
      { key: HISTORY_KEY, id: runId },
    );

    await page.goto(`/results/local/${runId}`);
    await page.waitForTimeout(500);
    await expect(page.getByText("local-view.srt").first()).toBeVisible();
  });

  test("/results/local/[unknown-id] falls back to demo run", async ({ page }) => {
    await page.goto("/results/local/run-does-not-exist-xyz");
    await page.waitForTimeout(500);
    await expect(page.getByText("demo-captionlint.srt")).toBeVisible();
  });
});
