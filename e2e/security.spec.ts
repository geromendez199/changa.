import { test, expect } from "./support/test-base";
import { AUTH_PATHS, hasSupabaseSession } from "./support/auth";

test.describe.serial("@security", () => {
  test.use({ storageState: AUTH_PATHS.provider });

  test("@security XSS en inputs no ejecuta markup al guardar perfil", async ({ page }) => {
    test.skip(!(await hasSupabaseSession(page)), "Requires an authenticated session.");

    const payload = "<script>window.__xss = true</script><img src=x onerror=alert(1)>";

    await page.goto("/profile/edit", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.locator('input[placeholder="Nombre público"]').fill(payload);
    await page.locator('input[placeholder="Ubicación"]').fill("Rafaela, Santa Fe");
    await page.getByRole("button", { name: /guardar cambios/i }).click();
    await page.waitForLoadState("networkidle").catch(() => undefined);

    const xssExecuted = await page.evaluate(() => Boolean((window as Window & { __xss?: boolean }).__xss));
    expect(xssExecuted).toBe(false);
  });

  test("@security Input de 1000 chars no rompe la UI", async ({ page }) => {
    test.skip(!(await hasSupabaseSession(page)), "Requires an authenticated session.");

    const longText = "A".repeat(1000);
    await page.goto("/profile/edit", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.locator('textarea').fill(longText);
    await page.locator('input[placeholder="Ubicación"]').fill("Rafaela, Santa Fe");
    await page.getByRole("button", { name: /guardar cambios/i }).click();
    await page.waitForTimeout(1500);

    await expect(page.locator("body")).toBeVisible();
  });

  test("@security Precio con texto es validado", async ({ page }) => {
    test.skip(!(await hasSupabaseSession(page)), "Requires an authenticated session.");

    await page.goto("/publish", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.getByRole("button", { name: /^Otros$/i }).click();
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.locator('input[placeholder*="Arreglar" i]').fill("QA precio inválido");
    await page.locator("textarea").fill("Caso de validación de precio inválido para Playwright.");
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.locator('input[placeholder*="Ubicación" i]').fill("Rafaela, Santa Fe");
    await page.locator('input[type="number"]').fill("abc");
    await page.locator('input[placeholder*="Cuándo" i]').fill("Mañana");
    await page.getByRole("button", { name: /continuar/i }).click();

    const bodyText = (await page.locator("body").textContent()) ?? "";
    expect(bodyText).toMatch(/precio v[aá]lido|presupuesto|ingres[aá] un precio/i);
  });
});
