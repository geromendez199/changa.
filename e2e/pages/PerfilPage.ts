import type { Page } from "@playwright/test";
import { ROUTES } from "../support/constants";
import { gotoFirstAvailableRoute } from "../support/navigation";
import { clickFirstVisible, fillFirstVisible, resolveVisibleLocator } from "../support/ui";

export class PerfilPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await gotoFirstAvailableRoute(this.page, ROUTES.profile);
  }

  async editName(name: string) {
    const nameField = await resolveVisibleLocator([
      this.page.locator('input[placeholder*="Nombre" i]'),
      this.page.locator('input[placeholder*="name" i]'),
    ]);

    if (!nameField) {
      await gotoFirstAvailableRoute(this.page, ROUTES.profileEdit);
    }

    await fillFirstVisible(
      [
        this.page.locator('input[placeholder*="Nombre" i]'),
        this.page.locator('input[placeholder*="name" i]'),
      ],
      name,
      "profile name",
    );
  }

  async saveProfile() {
    await clickFirstVisible(
      [
        this.page.getByRole("button", { name: /guardar cambios|guardar/i }),
        this.page.locator('button:has-text("Guardar cambios")'),
      ],
      "save profile",
    );
  }

  async getDisplayedName() {
    const input = await resolveVisibleLocator([
      this.page.locator('input[placeholder*="Nombre" i]'),
      this.page.locator('input[placeholder*="name" i]'),
    ]);

    if (input) {
      return input.inputValue();
    }

    const heading = await resolveVisibleLocator([
      this.page.getByRole("heading", { level: 1 }),
    ]);

    return heading ? (await heading.textContent())?.trim() ?? null : null;
  }
}
