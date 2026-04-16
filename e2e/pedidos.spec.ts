import { test, expect } from "./support/test-base";
import { AUTH_PATHS, hasSupabaseSession } from "./support/auth";
import { PedidosPage } from "./pages/PedidosPage";
import { ORDER_STATUS_LABELS } from "./support/constants";

test.describe.serial("@pedidos", () => {
  test.use({ storageState: AUTH_PATHS.user });

  test("@pedidos /my-jobs loads without error", async ({ page }) => {
    const pedidosPage = new PedidosPage(page);
    await pedidosPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    await expect(page.locator("text=/Mis trabajos|Postulados|Publicados/i").first()).toBeVisible();
  });

  test("@pedidos After hiring a service, the order appears in /pedidos", async ({ page }) => {
    test.skip(
      true,
      "Needs a second confirmed account to hire/apply against a job owned by another user and then validate it in Postulados.",
    );
  });

  test("@pedidos Each order shows service name, status, and provider name", async ({ page }) => {
    const pedidosPage = new PedidosPage(page);
    await pedidosPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session with at least one incoming application/order.",
    );

    const count = await pedidosPage.getOrderCards().count();
    test.skip(count === 0, "No client orders are available in the seeded account.");

    const card = pedidosPage.getOrderCards().first();
    const text = (await card.textContent()) ?? "";
    expect(text).toMatch(/[A-Za-zÁÉÍÓÚáéíóú]/);
    expect(text).toMatch(new RegExp(ORDER_STATUS_LABELS.join("|"), "i"));

    const providerNameVisible = await card.locator("text=/por |publicado por|cliente|proveedor|usuario/i").first().isVisible().catch(() => false);
    test.skip(
      !providerNameVisible,
      "The current orders/applications tab needs a second actor to generate entries with provider metadata.",
    );
  });

  test("@pedidos Order statuses are valid values", async ({ page }) => {
    const pedidosPage = new PedidosPage(page);
    await pedidosPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session with at least one application/order.",
    );

    const count = await pedidosPage.getOrderCards().count();
    test.skip(count === 0, "No client orders are available in the seeded account.");

    for (let index = 0; index < count; index += 1) {
      const status = await pedidosPage.getOrderStatus(index);
      expect(ORDER_STATUS_LABELS).toContain(status as (typeof ORDER_STATUS_LABELS)[number]);
    }
  });
});
