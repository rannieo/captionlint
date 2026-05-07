import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class HistoryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/history");
  }

  async waitForTable() {
    await this.page.waitForSelector("table");
  }

  async clickReRunForFile(filename: string) {
    const row = this.page.locator("tr", { hasText: filename }).first();
    await row.locator('[aria-label="Re-run with different preset"]').click();
  }

  async expectRowExists(filename: string) {
    await expect(this.page.locator("tr", { hasText: filename }).first()).toBeVisible();
  }

  async expectRowCount(n: number) {
    await expect(this.page.locator("tbody tr")).toHaveCount(n);
  }

  async expectDemoBadgeOnRow(filename: string) {
    const row = this.page.locator("tr", { hasText: filename }).first();
    await expect(row.locator("[data-demo='true']")).toBeVisible();
  }

  async expectNoDemoBadgeOnRow(filename: string) {
    const row = this.page.locator("tr", { hasText: filename }).first();
    await expect(row.locator("[data-demo='true']")).not.toBeVisible();
  }

  async expectFirstRowFilename(filename: string) {
    await expect(this.page.locator("tbody tr").first()).toContainText(filename);
  }
}
