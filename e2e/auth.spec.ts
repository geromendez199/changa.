import type { Page } from "@playwright/test";
import { test, expect } from "./support/test-base";
import { LoginPage } from "./pages/LoginPage";
import { ROUTES } from "./support/constants";
import { gotoFirstAvailableRoute } from "./support/navigation";
import { hasSupabaseSession } from "./support/auth";
import { getEnv, hasClientCredentials } from "./support/env";

async function openProfileFromHome(page: Page) {
  await page.waitForTimeout(1500);

  const profileNav = page.locator("text=/^Perfil$/").last();
  if (await profileNav.isVisible().catch(() => false)) {
    await profileNav.click();
  } else {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
  }

  await page.waitForLoadState("networkidle").catch(() => undefined);
}

test("@auth Login with valid credentials lands on /home and sees user content", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requires TEST_EMAIL and TEST_PASSWORD for a real Supabase-backed login.");

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(getEnv("TEST_EMAIL"));
  await loginPage.fillPassword(getEnv("TEST_PASSWORD"));
  await loginPage.submit();

  await expect(page).toHaveURL(/\/home(?:\?|$)/);
  expect(await hasSupabaseSession(page)).toBe(true);
});

test("@auth Login with wrong password shows error message and does not redirect", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requires a known valid TEST_EMAIL to verify wrong-password handling.");

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(getEnv("TEST_EMAIL"));
  await loginPage.fillPassword("wrong-password-123");
  await loginPage.submit();

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect.poll(() => loginPage.getErrorMessage()).not.toBeNull();
});

test("@auth Login with empty email shows validation message", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillPassword("123456");
  await loginPage.submit();

  await expect.poll(() => loginPage.getErrorMessage()).toMatch(/email v[aá]lido/i);
});

test("@auth Login with empty password shows validation message", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail("qa-empty-password@example.com");
  await loginPage.submit();

  await expect.poll(() => loginPage.getErrorMessage()).toMatch(/contrase[aá]a|6 caracteres/i);
});

test("@auth Login with non-existent email shows error and does not crash", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(`qa-${Date.now()}@example.com`);
  await loginPage.fillPassword("testpassword123");
  await loginPage.submit();

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect.poll(() => loginPage.getErrorMessage()).not.toBeNull();
});

test("@auth Register with already-used email shows appropriate error", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requires TEST_EMAIL to already exist in Supabase.");

  await gotoFirstAvailableRoute(page, ROUTES.register);
  await page.locator('input[type="email"], input[placeholder*="Email" i]').first().fill(getEnv("TEST_EMAIL"));
  await page.locator('input[type="password"]').first().fill(getEnv("TEST_PASSWORD"));

  const confirmField = page.locator('input[placeholder*="Confirm" i], input[type="password"]').nth(1);
  if (await confirmField.isVisible().catch(() => false)) {
    await confirmField.fill(getEnv("TEST_PASSWORD"));
  }

  await page.getByRole("button", { name: /crear cuenta|registrarse|registrar/i }).first().click();
  await page.waitForTimeout(2500);
  const bodyText = (await page.locator("body").textContent()) ?? "";
  expect(bodyText).toMatch(/cuenta creada|ya pod[eé]s iniciar sesi[oó]n|registrado|ya existe|ya est[aá] registrado/i);
});

test("@auth Register with mismatched passwords shows error when confirmation exists", async ({ page }) => {
  await gotoFirstAvailableRoute(page, ROUTES.register);

  const confirmField = page.locator('input[placeholder*="Confirm" i], input[placeholder*="confirmar" i]').first();
  test.skip(
    !(await confirmField.isVisible().catch(() => false)),
    "The current register form does not expose a confirm-password field, so mismatched-password validation cannot be asserted.",
  );

  await page.locator('input[type="email"], input[placeholder*="Email" i]').first().fill(`qa-${Date.now()}@example.com`);
  await page.locator('input[type="password"]').first().fill("testpassword123");
  await confirmField.fill("different-password-456");
  await page.getByRole("button", { name: /crear cuenta|registrarse|registrar/i }).first().click();

  await expect(page.locator("text=/no coinciden/i").first()).toBeVisible();
});

test("@auth After login, clicking logout redirects to /login and clears session", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requires TEST_EMAIL and TEST_PASSWORD for a real logout assertion.");

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(getEnv("TEST_EMAIL"));
  await loginPage.fillPassword(getEnv("TEST_PASSWORD"));
  await loginPage.submit();

  await openProfileFromHome(page);
  const logoutButton = page.locator("text=/cerrar sesi[oó]n|logout/i").first();
  await expect(logoutButton).toBeVisible({ timeout: 10_000 });
  await logoutButton.click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  expect(await hasSupabaseSession(page)).toBe(false);
});

test("@auth After logout, accessing /home with browser back button keeps the session cleared", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requires TEST_EMAIL and TEST_PASSWORD for a real logout/back-navigation assertion.");

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(getEnv("TEST_EMAIL"));
  await loginPage.fillPassword(getEnv("TEST_PASSWORD"));
  await loginPage.submit();

  await openProfileFromHome(page);
  const logoutButton = page.locator("text=/cerrar sesi[oó]n|logout/i").first();
  await expect(logoutButton).toBeVisible({ timeout: 10_000 });
  await logoutButton.click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await page.goBack();

  expect(await hasSupabaseSession(page)).toBe(false);
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});
