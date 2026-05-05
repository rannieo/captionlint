import type { Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

export class UploadPage {
  constructor(private page: Page) {}

  async goto(params?: { runId?: string; source?: string; preset?: string }) {
    const url = new URL("/upload", "http://localhost:3000");
    if (params?.runId) url.searchParams.set("runId", params.runId);
    if (params?.source) url.searchParams.set("source", params.source);
    if (params?.preset) url.searchParams.set("preset", params.preset);
    await this.page.goto(url.toString());
  }

  async uploadFile(filename: string) {
    const filePath = path.join(FIXTURES_DIR, filename);
    await this.page.setInputFiles("input[type='file']", filePath);
  }

  async selectPreset(label: string) {
    await this.page.getByRole("combobox").first().click();
    await this.page.getByRole("option", { name: label }).click();
  }

  async clickRunQA() {
    await this.page.getByRole("button", { name: /run qa/i }).click();
  }

  async waitForRedirectToResults() {
    await this.page.waitForURL("**/results");
  }

  async expectReFicModeVisible() {
    await this.page.waitForSelector("text=Re-fix Caption File");
  }

  async expectFilePickerHidden() {
    const fileInput = this.page.locator("input[type='file']");
    await fileInput.waitFor({ state: "hidden" });
  }

  async expectStatusText(text: string) {
    await this.page.waitForSelector(`text=${text}`);
  }

  async expectErrorText(text: string) {
    await this.page.waitForSelector(`text=${text}`);
  }
}
