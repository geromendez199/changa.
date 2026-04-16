import { test, expect } from "./support/test-base";
import { expectRedirectToLogin } from "./support/navigation";

test("@routes Sin auth /home carga público", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/home(?:\?|$)/);
});

test("@routes Sin auth /my-jobs redirige a /login", async ({ page }) => {
  await page.goto("/my-jobs", { waitUntil: "domcontentloaded" });
  await expectRedirectToLogin(page);
});

test("@routes Sin auth /publish redirige a /login", async ({ page }) => {
  await page.goto("/publish", { waitUntil: "domcontentloaded" });
  await expectRedirectToLogin(page);
});

test("@routes Sin auth /profile redirige a /login", async ({ page }) => {
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expectRedirectToLogin(page);
});

test("@routes URL inexistente muestra 404 o pantalla de ruta inválida", async ({ page }) => {
  await page.goto("/ruta-inexistente-qa-playwright", { waitUntil: "domcontentloaded" });
  const bodyText = (await page.locator("body").textContent()) ?? "";
  expect(bodyText).toMatch(/404|ruta inv[aá]lida|ir al inicio/i);
});
