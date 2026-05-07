import { test, expect } from "@playwright/test";
import { UploadPage } from "./pages/upload-page";

const HISTORY_KEY = "captionlint.historyRuns";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Upload — happy path", () => {
  test("upload page loads with file drop zone", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("Drag & drop your file here")).toBeVisible();
  });

  test("Run QA button is disabled before a file is selected", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByRole("button", { name: /run qa/i })).toBeDisabled();
  });

  test("selecting an SRT file shows filename in the drop zone", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await expect(page.getByText("sample.srt").first()).toBeVisible();
  });

  test("Run QA button enables after a valid file is selected", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await expect(page.getByRole("button", { name: /run qa/i })).toBeEnabled();
  });

  test("status message says 'is ready for … QA' after file selection", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await expect(page.getByText(/is ready for/)).toBeVisible();
  });

  test("preset dropdown can be changed to TikTok", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.selectPreset("TikTok");
    await expect(page.getByRole("combobox").first()).toContainText("TikTok");
  });

  test("preset dropdown can be changed to Instagram", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.selectPreset("Instagram");
    await expect(page.getByRole("combobox").first()).toContainText("Instagram");
  });

  test("preset dropdown can be changed to YouTube Shorts", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.selectPreset("YouTube Shorts");
    await expect(page.getByRole("combobox").first()).toContainText("YouTube Shorts");
  });

  test("successful run redirects to /results", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await upload.clickRunQA();
    await upload.waitForRedirectToResults();
    await expect(page).toHaveURL(/\/results/);
  });

  test("after run, localStorage historyRuns contains the new entry", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await upload.clickRunQA();
    await upload.waitForRedirectToResults();

    const runs = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "[]"),
      HISTORY_KEY,
    );
    expect(runs.length).toBe(1);
    expect(runs[0].file).toBe("sample.srt");
  });

  test("removing selected file resets status and disables Run QA button", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await page.locator('[aria-label="Remove file"]').click();
    await expect(page.getByText("Choose an SRT or VTT file to begin.")).toBeVisible();
    await expect(page.getByRole("button", { name: /run qa/i })).toBeDisabled();
  });

  test("run mode dropdown shows Deterministic QA option", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("Deterministic QA")).toBeVisible();
  });

  test("monthly usage meter is visible for guest users", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await expect(page.getByText("Monthly Usage")).toBeVisible();
  });
});

test.describe("Upload — negative path", () => {
  test("unsupported file type (.txt) shows error message", async ({ page }) => {
    await page.goto("/upload");
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["content"], "captions.txt", { type: "text/plain" }));
      return dt;
    });
    await page.locator(".border-dashed").first().dispatchEvent("dragover");
    await page.locator(".border-dashed").first().dispatchEvent("drop", { dataTransfer });
    await expect(page.getByText(/unsupported file type/i)).toBeVisible();
  });

  test("file over 1 MB shows size error", async ({ page }) => {
    await page.goto("/upload");
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["x".repeat(1_100_000)], "large.srt", { type: "text/plain" }));
      return dt;
    });
    await page.locator(".border-dashed").first().dispatchEvent("dragover");
    await page.locator(".border-dashed").first().dispatchEvent("drop", { dataTransfer });
    await expect(page.getByText(/too large/i)).toBeVisible();
  });

  test("Run QA button is disabled while run is in progress", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await upload.clickRunQA();
    await expect(page.getByRole("button", { name: /running qa/i })).toBeDisabled();
  });

  test("loading spinner appears while Run QA is in progress", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await upload.clickRunQA();
    await expect(page.locator(".animate-spin")).toBeVisible();
  });

  test("'Parsing captions' status text appears during run", async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.uploadFile("sample.srt");
    await upload.clickRunQA();
    await expect(page.getByText(/parsing captions/i)).toBeVisible();
  });

  test("drag-over a file changes drop zone border to green", async ({ page }) => {
    await page.goto("/upload");
    const dropZone = page.locator(".border-dashed").first();
    await dropZone.dispatchEvent("dragover");
    // When isDragging=true the border class changes from border-[#1F2937] to border-[#22C55E]
    await expect(dropZone).toHaveClass(/border-\[#22C55E\]/);
  });

  test("drag-leave resets drop zone border back to default", async ({ page }) => {
    await page.goto("/upload");
    const dropZone = page.locator(".border-dashed").first();
    await dropZone.dispatchEvent("dragover");
    await dropZone.dispatchEvent("dragleave", { relatedTarget: null });
    await expect(dropZone).not.toHaveClass(/border-\[#22C55E\]/);
  });
});
