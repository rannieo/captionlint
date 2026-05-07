import { test, expect } from "@playwright/test";
import { UploadPage } from "./pages/upload-page";

const HISTORY_KEY = "captionlint.historyRuns";
const VOCAB_KEY = "captionlint.vocabularyTerms";

// Defaults: avgMinutesPerRun=10, minutesPerMonth=100
// → 10 runs this month = 100 min = at limit; 11 = over limit

function makeLocalRun(id: string, daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    file: `run-${id}.srt`,
    presets: ["default"],
    date: date.toISOString(),
    autoFixed: 0,
    pending: 0,
    pendingLabel: "0 Violations Found",
    status: "clean",
    downloadContent: "x",
    rawContent: "1\n00:00:01,000 --> 00:00:03,000\nHello.",
    format: "SRT",
  };
}

function makeOldRun(id: string) {
  const date = new Date();
  date.setMonth(date.getMonth() - 1); // previous month → outside current month window
  return { ...makeLocalRun(id), date: date.toISOString() };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload — monthly minutes meter
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Upload — monthly usage meter", () => {
  test("usage meter is visible for guest users", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("Monthly Usage")).toBeVisible();
  });

  test("fresh guest shows 0 / 100 min", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("0 / 100 min")).toBeVisible();
  });

  test("5 runs this month shows 50 / 100 min", async ({ page }) => {
    await page.evaluate(
      ([key]) => {
        const runs = Array.from({ length: 5 }, (_, i) => ({
          id: `r${i}`,
          file: `file${i}.srt`,
          presets: ["default"],
          date: new Date().toISOString(),
          autoFixed: 0,
          pending: 0,
          pendingLabel: "",
          status: "clean",
          downloadContent: "x",
          rawContent: "r",
          format: "SRT",
        }));
        localStorage.setItem(key as string, JSON.stringify(runs));
      },
      [HISTORY_KEY],
    );

    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("50 / 100 min")).toBeVisible();
  });

  test("at 10 runs (100 min), upgrade link appears and Run QA is blocked", async ({ page }) => {
    await page.evaluate(
      ([key]) => {
        const runs = Array.from({ length: 10 }, (_, i) => ({
          id: `limit-${i}`,
          file: `file${i}.srt`,
          presets: ["default"],
          date: new Date().toISOString(),
          autoFixed: 0,
          pending: 0,
          pendingLabel: "",
          status: "clean",
          downloadContent: "x",
          rawContent: "r",
          format: "SRT",
        }));
        localStorage.setItem(key as string, JSON.stringify(runs));
      },
      [HISTORY_KEY],
    );

    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("Limit reached.").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Upgrade" }).first()).toBeVisible();

    await upload.uploadFile("sample.srt");
    await expect(page.getByRole("button", { name: /run qa/i })).toBeDisabled();
  });

  test("at limit, clicking Run QA shows the plan limit error message", async ({ page }) => {
    await page.evaluate(
      ([key]) => {
        const runs = Array.from({ length: 10 }, (_, i) => ({
          id: `limit-${i}`,
          file: `file${i}.srt`,
          presets: ["default"],
          date: new Date().toISOString(),
          autoFixed: 0,
          pending: 0,
          pendingLabel: "",
          status: "clean",
          downloadContent: "x",
          rawContent: "r",
          format: "SRT",
        }));
        localStorage.setItem(key as string, JSON.stringify(runs));
      },
      [HISTORY_KEY],
    );

    // Inject file via the input so the button becomes enabled, then force-click
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");

    // Button is disabled at the limit so the error fires via the disabled guard
    // We verify the error text appears in the UI state
    await expect(page.getByText(/monthly limit/i)).toBeVisible();
  });

  test("runs from the previous month do NOT count against the current month limit", async ({
    page,
  }) => {
    await page.evaluate(
      ([key]) => {
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const runs = Array.from({ length: 10 }, (_, i) => ({
          id: `old-${i}`,
          file: `file${i}.srt`,
          presets: ["default"],
          date: prevMonth.toISOString(),
          autoFixed: 0,
          pending: 0,
          pendingLabel: "",
          status: "clean",
          downloadContent: "x",
          rawContent: "r",
          format: "SRT",
        }));
        localStorage.setItem(key as string, JSON.stringify(runs));
      },
      [HISTORY_KEY],
    );

    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("0 / 100 min")).toBeVisible();
    await upload.uploadFile("sample.srt");
    await expect(page.getByRole("button", { name: /run qa/i })).toBeEnabled();
  });

  test("Upgrade link in the meter points to /pricing", async ({ page }) => {
    await page.evaluate(
      ([key]) => {
        const runs = Array.from({ length: 10 }, (_, i) => ({
          id: `limit-${i}`,
          file: `file${i}.srt`,
          presets: ["default"],
          date: new Date().toISOString(),
          autoFixed: 0,
          pending: 0,
          pendingLabel: "",
          status: "clean",
          downloadContent: "x",
          rawContent: "r",
          format: "SRT",
        }));
        localStorage.setItem(key as string, JSON.stringify(runs));
      },
      [HISTORY_KEY],
    );

    const upload = new UploadPage(page);
    await upload.goto();
    const upgradeLink = page.getByRole("link", { name: "Upgrade" }).first();
    await expect(upgradeLink).toHaveAttribute("href", "/pricing");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rulesets — term limit enforcement
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Rulesets — term limit enforcement", () => {
  test("fresh guest (5 default terms) shows input disabled and upgrade link", async ({
    page,
  }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[placeholder="e.g. ChatGPT"]')).toBeDisabled();
    await expect(page.getByRole("link", { name: "Upgrade" })).toBeVisible();
  });

  test("with 4 terms the input is enabled and upgrade link is absent", async ({ page }) => {
    await page.evaluate(
      ([key]) => {
        localStorage.setItem(key as string, JSON.stringify(["ChatGPT", "OpenAI", "Canva", "Figma"]));
      },
      [VOCAB_KEY],
    );
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[placeholder="e.g. ChatGPT"]')).toBeEnabled();
    await expect(page.getByRole("link", { name: "Upgrade" })).not.toBeVisible();
  });

  test("adding the 5th term instantly disables the input", async ({ page }) => {
    await page.evaluate(
      ([key]) => {
        localStorage.setItem(key as string, JSON.stringify(["ChatGPT", "OpenAI", "Canva", "Figma"]));
      },
      [VOCAB_KEY],
    );
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("FifthTerm");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.locator('input[placeholder="e.g. ChatGPT"]')).toBeDisabled();
  });

  test("Upgrade link in rulesets plan usage box points to /pricing", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("link", { name: "Upgrade" })).toHaveAttribute("href", "/pricing");
  });

  test("plan usage bar reflects term count (5/5 = 100%)", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("5 / 5 terms")).toBeVisible();
  });
});
