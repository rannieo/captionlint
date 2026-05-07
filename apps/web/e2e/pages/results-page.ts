import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class ResultsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/results");
  }

  async gotoLocal(runId: string) {
    await this.page.goto(`/results/local/${encodeURIComponent(runId)}`);
  }

  async waitForClientHydration() {
    // Wait for the results client to mount and render findings
    await this.page.waitForSelector("[data-findings-panel]", { timeout: 5000 });
    await this.page.waitForTimeout(200);
  }

  async expectTopbarFilename(name: string) {
    await expect(this.page.getByRole("banner").getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectTopbarIssueCount(count: number) {
    await expect(this.page.getByText(`${count} Issues`)).toBeVisible();
  }

  async expectFindingsCount(n: number) {
    const findingRows = this.page.locator("[data-findings-panel] button[type='button']");
    await expect(findingRows).toHaveCount(n);
  }

  async clickExport() {
    await this.page.getByRole("button", { name: /export fixed file/i }).click();
  }
}
