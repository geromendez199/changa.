import type { Locator, Page } from "@playwright/test";
import { ROUTES, ORDER_STATUS_LABELS } from "../support/constants";
import { gotoFirstAvailableRoute } from "../support/navigation";

export class PedidosPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await gotoFirstAvailableRoute(this.page, ROUTES.orders);
    const postuladosTab = this.page.getByRole("button", { name: /postulados|pedidos|orders/i }).first();
    if (await postuladosTab.isVisible().catch(() => false)) {
      await postuladosTab.click();
    }
  }

  getOrderCards(): Locator {
    return this.page.locator(".app-surface").filter({
      has: this.page.locator(`text=/${ORDER_STATUS_LABELS.join("|")}/i`),
    });
  }

  async getOrderStatus(index: number) {
    const card = this.getOrderCards().nth(index);
    const text = (await card.textContent()) ?? "";
    return ORDER_STATUS_LABELS.find((status) => new RegExp(status, "i").test(text)) ?? null;
  }
}
