import { test, expect, type Page } from "@playwright/test";

const VOCAB_KEY = "captionlint.vocabularyTerms";
// Default terms from @repo/config — exactly 5, which fills the free plan limit
const DEFAULT_TERMS = ["ChatGPT", "OpenAI", "Midjourney", "Canva", "YouTube Shorts"];
// Sub-limit set for "add" tests (2 terms, safely under the 5-term cap)
const FEW_TERMS = ["ChatGPT", "OpenAI"];

async function seedTerms(page: Page, terms: string[]) {
  await page.goto("/");
  await page.evaluate(
    ({ key, t }: { key: string; t: string[] }) => localStorage.setItem(key, JSON.stringify(t)),
    { key: VOCAB_KEY, t: terms },
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Rulesets — happy path", () => {
  test("rulesets page loads and renders a terms table", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table")).toBeVisible();
  });

  test("all five default terms are visible on fresh load", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    for (const term of DEFAULT_TERMS) {
      await expect(page.getByText(term).first()).toBeVisible();
    }
  });

  test("plan usage counter shows '5 / 5 terms' when at limit", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("5 / 5 terms")).toBeVisible();
  });

  test("adding a new term shows the success message", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("BrandName");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.getByText("BrandName will be checked during future lint runs.")).toBeVisible();
  });

  test("new term appears in the table", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("NewTerm");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.locator("table").getByText("NewTerm")).toBeVisible();
  });

  test("adding a term via Enter key works", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("EnterTerm");
    await page.locator('input[placeholder="e.g. ChatGPT"]').press("Enter");
    await expect(page.locator("table").getByText("EnterTerm")).toBeVisible();
  });

  test("added term is persisted to localStorage", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("PersistTerm");
    await page.getByRole("button", { name: "+ Save Term" }).click();

    const stored: string[] = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "[]"),
      VOCAB_KEY,
    );
    expect(stored).toContain("PersistTerm");
  });

  test("removing a term shows the removal confirmation message", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator("tr", { hasText: "ChatGPT" }).first().getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("ChatGPT removed from future lint runs.")).toBeVisible();
  });

  test("removed term disappears from the table", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator("tr", { hasText: "ChatGPT" }).first().getByRole("button", { name: "Remove" }).click();
    await expect(page.locator("tbody").getByText("ChatGPT")).not.toBeVisible();
  });

  test("removed term is removed from localStorage", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator("tr", { hasText: "ChatGPT" }).first().getByRole("button", { name: "Remove" }).click();

    const stored: string[] = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "[]"),
      VOCAB_KEY,
    );
    expect(stored).not.toContain("ChatGPT");
  });

  test("filter input narrows visible terms", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="Filter terms..."]').fill("ChatGPT");
    await expect(page.locator("tbody").getByText("ChatGPT")).toBeVisible();
    await expect(page.locator("tbody").getByText("OpenAI")).not.toBeVisible();
  });

  test("clearing the filter shows all terms again", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    const filterInput = page.locator('input[placeholder="Filter terms..."]');
    await filterInput.fill("ChatGPT");
    await filterInput.clear();
    await expect(page.locator("tbody").getByText("OpenAI")).toBeVisible();
  });

  test("terms count displays correctly after an addition", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("ThirdTerm");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.getByText("3 Terms Active")).toBeVisible();
  });
});

test.describe("Rulesets — negative path", () => {
  test("at 5-term limit (default), Add Term input is disabled", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[placeholder="e.g. ChatGPT"]')).toBeDisabled();
  });

  test("at 5-term limit, + Save Term button is disabled", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "+ Save Term" })).toBeDisabled();
  });

  test("at 5-term limit, upgrade link is visible in plan usage box", async ({ page }) => {
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("link", { name: "Upgrade" })).toBeVisible();
  });

  test("adding a duplicate term (case-insensitive) shows 'already protected' message", async ({
    page,
  }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("chatgpt");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.getByText(/already protected/i)).toBeVisible();
  });

  test("duplicate does not add a new row", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    const countBefore = await page.locator("tbody tr").count();
    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("chatgpt");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(countBefore);
  });

  test("whitespace-only input does not add a term", async ({ page }) => {
    await seedTerms(page, FEW_TERMS);
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    const countBefore = await page.locator("tbody tr").count();
    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("   ");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(countBefore);
  });

  test("adding the 5th term immediately disables the input", async ({ page }) => {
    await seedTerms(page, ["ChatGPT", "OpenAI", "Canva", "Figma"]); // 4 terms
    await page.goto("/rulesets");
    await page.waitForLoadState("networkidle");

    await page.locator('input[placeholder="e.g. ChatGPT"]').fill("FifthTerm");
    await page.getByRole("button", { name: "+ Save Term" }).click();
    await expect(page.locator('input[placeholder="e.g. ChatGPT"]')).toBeDisabled();
  });
});
