import { expect, type Page } from "@playwright/test";

export async function currentPath(page: Page) {
  return new URL(page.url()).pathname;
}

export async function isInvalidRoute(page: Page) {
  const invalidHeading = page.getByRole("heading", { name: /ruta inv[aá]lida/i }).first();
  return invalidHeading.isVisible().catch(() => false);
}

export async function gotoFirstAvailableRoute(page: Page, routes: readonly string[]) {
  let lastRoute = routes[0];

  for (const route of routes) {
    lastRoute = route;
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);

    const path = await currentPath(page);
    if (path === "/login" || !(await isInvalidRoute(page))) {
      return route;
    }
  }

  return lastRoute;
}

export async function expectRedirectToLogin(page: Page) {
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
}
