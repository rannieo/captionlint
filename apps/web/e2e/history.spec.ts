import { test, expect, type Page } from "@playwright/test";
import { HistoryPage } from "./pages/history-page";

const HISTORY_KEY = "captionlint.historyRuns";

type RunShape = {
  id: string;
  file: string;
  presets: string[];
  date: string;
  autoFixed: number;
  pending: number;
  pendingLabel: string;
  status: string;
  downloadContent: string;
  rawContent: string;
  format: string;
  [k: string]: unknown;
};

function makeRun(overrides: Partial<RunShape> = {}): RunShape {
  return {
    id: `run-${Math.random().toString(36).slice(2, 9)}`,
    file: "test-captions.srt",
    presets: ["default"],
    date: new Date().toISOString(),
    autoFixed: 2,
    pending: 1,
    pendingLabel: "1 Pending Review",
    status: "fixed",
    downloadContent: "1\n00:00:01,000 --> 00:00:03,000\nHello.\n",
    rawContent:
      "1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:03,500 --> 00:00:05,000\nSecond cue.",
    format: "SRT",
    ...overrides,
  };
}

async function seedRun(page: Page, run: RunShape) {
  await page.evaluate(
    ({ key, r }: { key: string; r: RunShape }) => localStorage.setItem(key, JSON.stringify([r])),
    { key: HISTORY_KEY, r: run },
  );
}

async function seedRuns(page: Page, runs: RunShape[]) {
  await page.evaluate(
    ({ key, r }: { key: string; r: RunShape[] }) => localStorage.setItem(key, JSON.stringify(r)),
    { key: HISTORY_KEY, r: runs },
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy path
// ─────────────────────────────────────────────────────────────────────────────

test.describe("History — happy path", () => {
  test("history page loads and renders the runs table", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    await expect(page.locator("table")).toBeVisible();
  });

  test("seed demo rows are shown in fresh state", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    await expect(page.locator("[data-demo='true']").first()).toBeVisible();
  });

  test("all four seed rows have demo badges", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    expect(await page.locator("[data-demo='true']").count()).toBe(4);
  });

  test("real localStorage run has no demo badge", async ({ page }) => {
    await seedRun(page, makeRun({ id: "run-real", file: "real-upload.srt" }));
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    await historyPage.expectNoDemoBadgeOnRow("real-upload.srt");
  });

  test("real run appears before seed rows in DOM order", async ({ page }) => {
    await seedRun(page, makeRun({ id: "run-first", file: "first-upload.srt" }));
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();
    await historyPage.expectFirstRowFilename("first-upload.srt");
  });

  test("filename search filter narrows visible rows", async ({ page }) => {
    await seedRuns(page, [
      makeRun({ id: "r1", file: "alpha.srt" }),
      makeRun({ id: "r2", file: "beta.srt" }),
    ]);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await page.locator('input[placeholder="Search by filename..."]').fill("alpha");
    await expect(page.locator("tr", { hasText: "alpha.srt" })).toBeVisible();
    await expect(page.locator("tr", { hasText: "beta.srt" })).not.toBeVisible();
  });

  test("clearing search filter restores all rows", async ({ page }) => {
    await seedRuns(page, [
      makeRun({ id: "r1", file: "alpha.srt" }),
      makeRun({ id: "r2", file: "beta.srt" }),
    ]);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await page.locator('input[placeholder="Search by filename..."]').fill("alpha");
    await page.locator('[aria-label="Clear search"]').click();
    await expect(page.locator("tr", { hasText: "beta.srt" })).toBeVisible();
  });

  test("Re-run button navigates to /upload/runs/[id]", async ({ page }) => {
    await seedRun(page, makeRun({ id: "run-rerun-test", file: "sample.srt" }));
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await historyPage.clickReRunForFile("sample.srt");
    await page.waitForURL(/\/upload\/runs\//);
  });

  test("View Results button navigates to /results/local/[id]", async ({ page }) => {
    await seedRun(page, makeRun({ id: "run-view-test", file: "view-test.srt" }));
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await page
      .locator("tr", { hasText: "view-test.srt" })
      .first()
      .locator('[aria-label="View results"]')
      .click();
    await page.waitForURL(/\/results\/local\//);
  });

  test("Download button triggers a browser download", async ({ page }) => {
    await seedRun(page, makeRun({ id: "run-dl-test", file: "dl-test.srt" }));
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page
        .locator("tr", { hasText: "dl-test.srt" })
        .first()
        .locator('[aria-label="Download fixed file"]')
        .click(),
    ]);
    expect(download.suggestedFilename()).toContain(".srt");
  });

  test("Last 7 Days filter toggles on and off", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    const btn = page.getByRole("button", { name: /last 7 days/i });
    await btn.click();
    await expect(btn).toContainText("✓");
    await btn.click();
    await expect(btn).not.toContainText("✓");
  });

  test("action buttons have correct aria-labels", async ({ page }) => {
    await seedRun(page, makeRun({ id: "run-aria", file: "aria-test.srt" }));
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    const row = page.locator("tr", { hasText: "aria-test.srt" }).first();
    await expect(row.locator('[aria-label="Re-run with different preset"]')).toBeVisible();
    await expect(row.locator('[aria-label="Download fixed file"]')).toBeVisible();
    await expect(row.locator('[aria-label="View results"]')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Negative path
// ─────────────────────────────────────────────────────────────────────────────

test.describe("History — negative path", () => {
  test("demo rows show 'Re-run unavailable' span, not the active Re-run button", async ({
    page,
  }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    const firstDemoRow = page
      .locator("tr")
      .filter({ has: page.locator("[data-demo='true']") })
      .first();
    await expect(firstDemoRow.locator('[aria-label="Re-run unavailable"]')).toBeVisible();
    await expect(
      firstDemoRow.locator('[aria-label="Re-run with different preset"]'),
    ).not.toBeVisible();
  });

  test("search with no matches shows 'No runs match your search' message", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await page
      .locator('input[placeholder="Search by filename..."]')
      .fill("zzz-nonexistent-xyz");
    await expect(page.getByText("No runs match your search.")).toBeVisible();
  });

  test("runs count text reflects filtered total", async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForTable();

    await page
      .locator('input[placeholder="Search by filename..."]')
      .fill("campaign_v3_final.srt");
    await expect(page.getByText(/1 of/)).toBeVisible();
  });
});
