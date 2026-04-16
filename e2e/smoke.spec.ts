import { test, expect } from "./support/test-base";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ROUTES } from "./support/constants";
import { gotoFirstAvailableRoute, expectRedirectToLogin } from "./support/navigation";

test("@smoke Homepage loads at /home — expect title contains Changa, status 200", async ({ page }) => {
  const response = await page.goto("/home", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Changa/i);
});

test("@smoke Unauthenticated user visiting /my-jobs redirects to /login", async ({ page }) => {
  await page.goto("/my-jobs", { waitUntil: "domcontentloaded" });
  await expectRedirectToLogin(page);
});

test("@smoke Unauthenticated user visiting /publish redirects to /login", async ({ page }) => {
  await page.goto("/publish", { waitUntil: "domcontentloaded" });
  await expectRedirectToLogin(page);
});

test("@smoke Unauthenticated user visiting /profile redirects to /login", async ({ page }) => {
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expectRedirectToLogin(page);
});

test("@smoke /login page renders email input, password input, and submit button", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await expect(page.locator('input[type="email"], input[placeholder*="Email" i]').first()).toBeVisible();
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: /entrar|ingresar|iniciar sesi[oó]n/i }).first()).toBeVisible();
});

test("@smoke /register page renders email, password fields and register button", async ({ page }) => {
  await gotoFirstAvailableRoute(page, ROUTES.register);
  await expect(page.locator('input[type="email"], input[placeholder*="Email" i]').first()).toBeVisible();
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: /crear cuenta|registrarse|registrar/i }).first()).toBeVisible();
});

test("@smoke No JS console errors on /home", async ({ page, consoleErrors }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(homePage.getServiceCards().first()).toBeVisible();
  expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
});

test("@smoke No broken images on /home", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const srcs = (await page.locator("img").evaluateAll((images) =>
    images
      .map((image) => image.getAttribute("src"))
      .filter((src): src is string => Boolean(src && !src.startsWith("data:"))),
  )) as string[];

  expect(srcs.length).toBeGreaterThan(0);

  for (const src of srcs) {
    const response = await page.context().request.get(new URL(src, page.url()).toString());
    expect(response.status(), `Broken image: ${src}`).toBeLessThan(400);
  }
});
