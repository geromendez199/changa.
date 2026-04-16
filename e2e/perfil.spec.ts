import { test, expect } from "./support/test-base";
import { AUTH_PATHS, hasSupabaseSession } from "./support/auth";
import { PerfilPage } from "./pages/PerfilPage";
import { uniqueValue } from "./support/scenarios";

test.describe.serial("@perfil", () => {
  test.use({ storageState: AUTH_PATHS.user });

  test("@perfil /perfil loads and shows current user info", async ({ page }) => {
    const perfilPage = new PerfilPage(page);
    await perfilPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated user session saved in auth/user.json.",
    );

    const currentName = await perfilPage.getDisplayedName();
    expect(currentName).toBeTruthy();
  });

  test("@perfil Edit name and save updates the name on screen", async ({ page }) => {
    const perfilPage = new PerfilPage(page);
    await perfilPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated user session and a writable Supabase profile.",
    );

    const nextName = uniqueValue("QA Perfil");
    await perfilPage.editName(nextName);
    await page.locator('input[placeholder="Ubicación"]').fill("Rafaela, Santa Fe");
    await perfilPage.saveProfile();
    await page.waitForLoadState("networkidle").catch(() => undefined);

    await expect(page.locator(`text=${nextName}`).first()).toBeVisible({ timeout: 10_000 });
  });

  test("@perfil Logout button is present and functional", async ({ page }) => {
    const perfilPage = new PerfilPage(page);
    await perfilPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated user session saved in auth/user.json.",
    );

    const logoutButton = page.getByRole("button", { name: /cerrar sesi[oó]n|logout/i }).first();
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });

  test("@perfil Saving profile with empty name shows validation error if applicable", async ({ page }) => {
    const perfilPage = new PerfilPage(page);
    await perfilPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated user session and a writable Supabase profile.",
    );

    await perfilPage.editName("");
    await perfilPage.saveProfile();
    await expect(page.locator("text=/nombre v[aá]lido|ingres[aá] un nombre/i").first()).toBeVisible();
  });
});
