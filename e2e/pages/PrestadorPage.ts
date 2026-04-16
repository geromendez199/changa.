import type { Locator, Page } from "@playwright/test";
import { ROUTES } from "../support/constants";
import { gotoFirstAvailableRoute } from "../support/navigation";
import { clickFirstVisible, fillFirstVisible, resolveVisibleLocator } from "../support/ui";

export class PrestadorPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await gotoFirstAvailableRoute(this.page, ROUTES.provider);
  }

  getServiceList(): Locator {
    return this.page.locator(".app-surface").filter({
      has: this.page.locator("text=/editar|eliminar|publicado|pausado|activo|servicio|changa/i"),
    });
  }

  async clickCreateService() {
    const clicked = await resolveVisibleLocator([
      this.page.getByRole("button", { name: /crear servicio|publicar una changa|publicar|create service/i }),
      this.page.getByRole("link", { name: /crear servicio|publicar una changa|publicar/i }),
    ]);

    if (clicked) {
      await clicked.click();
      return;
    }

    await gotoFirstAvailableRoute(this.page, ["/prestador", "/publish"]);
  }

  async fillServiceForm(title: string, description: string, price: number, category: string) {
    const categoryButton = await resolveVisibleLocator([
      this.page.getByRole("button", { name: new RegExp(`^${category}$`, "i") }),
    ]);

    if (categoryButton) {
      await categoryButton.click();
      const continueButton = await resolveVisibleLocator([
        this.page.getByRole("button", { name: /continuar/i }),
      ]);
      if (continueButton) await continueButton.click();
    }

    await fillFirstVisible(
      [
        this.page.locator('input[placeholder*="Arreglar" i]'),
        this.page.locator('input[placeholder*="título" i]'),
        this.page.locator('input[placeholder*="title" i]'),
        this.page.locator('input[name*="title" i]'),
      ],
      title,
      "service title",
    );

    await fillFirstVisible(
      [
        this.page.locator("textarea"),
        this.page.locator('textarea[placeholder*="descrip" i]'),
      ],
      description,
      "service description",
    );

    const continueAfterDetails = await resolveVisibleLocator([
      this.page.getByRole("button", { name: /continuar/i }),
    ]);
    if (continueAfterDetails) await continueAfterDetails.click();

    await fillFirstVisible(
      [
        this.page.locator('input[type="number"]'),
        this.page.locator('input[placeholder*="precio" i]'),
        this.page.locator('input[placeholder*="presupuesto" i]'),
      ],
      String(price),
      "service price",
    );

    const locationField = await resolveVisibleLocator([
      this.page.locator('input[placeholder*="ubicación" i]'),
      this.page.locator('input[placeholder*="location" i]'),
    ]);
    if (locationField) await locationField.fill("Rafaela, Santa Fe");

    const availabilityField = await resolveVisibleLocator([
      this.page.locator('input[placeholder*="cuándo" i]'),
      this.page.locator('input[placeholder*="dispon" i]'),
    ]);
    if (availabilityField) await availabilityField.fill("Mañana por la mañana");

    const finalContinue = await resolveVisibleLocator([
      this.page.getByRole("button", { name: /continuar/i }),
    ]);
    if (finalContinue) await finalContinue.click();
  }

  async submitServiceForm() {
    await clickFirstVisible(
      [
        this.page.getByRole("button", { name: /crear servicio|publicar changa|guardar cambios|guardar/i }),
        this.page.locator('button:has-text("Publicar changa")'),
      ],
      "submit service form",
    );
  }

  async deleteService(index: number) {
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.page.getByRole("button", { name: /eliminar|delete/i }).nth(index).click();
  }

  async togglePauseService(index: number) {
    const toggleButtons = this.page.getByRole("button", { name: /pausar|activar|activar servicio|desactivar/i });
    const count = await toggleButtons.count();
    if (count === 0) {
      throw new Error("No pause/activate control is visible for provider services.");
    }

    await toggleButtons.nth(index).click();
  }
}
