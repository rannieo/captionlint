import { test, expect } from "@playwright/test";
import { UploadPage } from "./pages/upload-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Gap 3 — Results topbar shows real run metadata", () => {
  test("shows demo filename when localStorage is empty", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(300);
    const topbar = page.locator("header, [role='banner']").first();
    await expect(topbar.getByText("demo-captionlint.srt")).toBeVisible();
  });

  test("shows real filename in topbar after a lint run", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    await uploadPage.uploadFile("sample.srt");
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    await page.waitForTimeout(300);
    const topbar = page.locator("header, [role='banner']").first();
    await expect(topbar.getByText("sample.srt")).toBeVisible();
  });

  test("topbar shows SRT format badge after SRT upload", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    await uploadPage.uploadFile("sample.srt");
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    await page.waitForTimeout(300);
    await expect(page.getByText("SRT", { exact: true }).first()).toBeVisible();
  });

  test("topbar issues count is non-zero for sample.srt findings", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
    await uploadPage.uploadFile("sample.srt");
    await uploadPage.clickRunQA();
    await uploadPage.waitForRedirectToResults();

    await page.waitForTimeout(300);
    const issuesBadge = page.getByText(/\d+ Issues/);
    await expect(issuesBadge).toBeVisible();
    const text = await issuesBadge.textContent();
    const count = Number.parseInt(text ?? "0", 10);
    expect(count).toBeGreaterThan(0);
  });
});
