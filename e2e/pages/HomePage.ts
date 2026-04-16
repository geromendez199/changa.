import type { Locator, Page } from "@playwright/test";
import { ROUTES, REQUESTED_SERVICE_CATEGORIES, FALLBACK_CATEGORY_LABELS } from "../support/constants";
import { gotoFirstAvailableRoute } from "../support/navigation";
import { clickFirstVisible, fillFirstVisible } from "../support/ui";

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await gotoFirstAvailableRoute(this.page, ROUTES.home);
  }

  getServiceCards(): Locator {
    return this.page.locator("button").filter({
      has: this.page.locator("img[alt]"),
    });
  }

  async filterByCategory(category: string) {
    await clickFirstVisible(
      [
        this.page.getByRole("button", { name: new RegExp(`^${category}$`, "i") }),
        this.page.getByText(new RegExp(`^${category}$`, "i")).locator(".."),
      ],
      `category filter ${category}`,
    );
  }

  async searchService(text: string) {
    await fillFirstVisible(
      [
        this.page.locator('input[placeholder*="Buscar" i]'),
        this.page.locator('input[type="search"]'),
      ],
      text,
      "service search",
    );
  }

  async clickServiceCard(index: number) {
    await this.getServiceCards().nth(index).click();
  }

  async getCategoryButtons() {
    const knownLabels = [...REQUESTED_SERVICE_CATEGORIES, ...FALLBACK_CATEGORY_LABELS, "Ver más", "All"];
    const texts = await this.page.getByRole("button").allTextContents();
    return texts
      .map((text) => text.trim())
      .filter(Boolean)
      .filter((text) => knownLabels.some((label) => text.includes(label)));
  }
}
