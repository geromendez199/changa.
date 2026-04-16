import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./support/test-base";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ROUTES } from "./support/constants";
import { gotoFirstAvailableRoute } from "./support/navigation";

test("@a11y Run axe-core on /home and report violations", async ({ page }, testInfo) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-home.json", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
});

test("@a11y Run axe-core on /login and report violations", async ({ page }, testInfo) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-login.json", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
});

test("@a11y Run axe-core on /register and report violations", async ({ page }, testInfo) => {
  await gotoFirstAvailableRoute(page, ROUTES.register);
  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-register.json", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
});

test("@a11y All images on /home have alt attributes or role presentation", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  const invalidCount = await page.locator('img:not([alt]):not([role="presentation"])').count();
  expect(invalidCount).toBe(0);
});

test("@a11y All form inputs on /login have associated labels or aria-label", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const inputHandles = await page.locator("input").elementHandles();
  for (const inputHandle of inputHandles) {
    const metadata = await inputHandle.evaluate((input) => {
      const id = input.getAttribute("id");
      const hasAriaLabel = Boolean(input.getAttribute("aria-label"));
      const hasPlaceholder = Boolean(input.getAttribute("placeholder"));
      const hasLabel = id ? Boolean(document.querySelector(`label[for="${id}"]`)) : false;
      return { hasAriaLabel, hasLabel, hasPlaceholder };
    });

    expect(metadata.hasAriaLabel || metadata.hasLabel || metadata.hasPlaceholder).toBe(true);
  }
});

test("@a11y Keyboard navigation tabs through login fields and submit button", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const focusedSequence: string[] = [];
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press("Tab");
    const description = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return active?.getAttribute("placeholder") || active?.textContent || active?.getAttribute("aria-label") || "";
    });
    focusedSequence.push(description.trim());
  }

  expect(focusedSequence.join(" ")).toMatch(/email/i);
  expect(focusedSequence.join(" ")).toMatch(/contrase/i);
  expect(focusedSequence.join(" ")).toMatch(/entrar|ingresar|iniciar/i);
});
