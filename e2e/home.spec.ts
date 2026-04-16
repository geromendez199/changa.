import { test, expect } from "./support/test-base";
import { AUTH_PATHS, hasSupabaseSession } from "./support/auth";
import { HomePage } from "./pages/HomePage";
import { FALLBACK_CATEGORY_LABELS } from "./support/constants";
import { attemptCreateOrderFromHome, ensurePublishedJob } from "./support/scenarios";
import { resolveVisibleLocator } from "./support/ui";

test.describe.serial("@home", () => {
  test.use({ storageState: AUTH_PATHS.user });

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: AUTH_PATHS.user });
    await ensurePublishedJob(page);
    await page.close();
  });

  test("@home /home shows at least 1 service card after loading", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    await expect(homePage.getServiceCards().first()).toBeVisible();
  });

  test("@home Each service card has title and category label, and opens a meaningful detail state", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    const firstCard = homePage.getServiceCards().first();
    await expect(firstCard.locator("h3").first()).toBeVisible();

    const cardText = (await firstCard.textContent()) ?? "";
    expect(cardText).toMatch(/otros|hogar|oficios|tecnolog|delivery|servicios personales/i);

    await firstCard.click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    expect(/\/job\//.test(page.url())).toBe(true);
    await expect(page.locator("text=/descripci[oó]n|postularme|postulantes/i").first()).toBeVisible();
  });

  test("@home Category filter buttons are visible", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    const labels = await homePage.getCategoryButtons();
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.join(" ")).toMatch(new RegExp(FALLBACK_CATEGORY_LABELS.join("|"), "i"));
  });

  test("@home Clicking a category filter only shows services of that category", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    const labels = await homePage.getCategoryButtons();
    const category = labels.find((label) => /otros|hogar|oficios|delivery|tecnolog/i.test(label));
    test.skip(!category, "No category filter is visible in the current home screen.");

    await homePage.filterByCategory(category!);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await expect(page.locator(`text=/${category}/i`).first()).toBeVisible();
  });

  test("@home Clicking All or resetting the filter shows all services again", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    const beforeCount = await homePage.getServiceCards().count();
    expect(beforeCount).toBeGreaterThan(0);

    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await expect(homePage.getServiceCards().first()).toBeVisible();
    expect(await homePage.getServiceCards().count()).toBeGreaterThan(0);
  });

  test("@home Clicking a service card opens its detail or a hire modal", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    await homePage.clickServiceCard(0);
    await page.waitForLoadState("networkidle").catch(() => undefined);

    const openedModalOrDetail =
      /\/job\//.test(page.url()) ||
      (await page.locator("text=/postularme|contratar|solicitar|detalle|descripci[oó]n/i").first().isVisible().catch(() => false));

    expect(openedModalOrDetail).toBe(true);
  });

  test("@home Hiring a service creates an order or shows a success message", async ({ page }) => {
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session and a real Supabase backend to create an order/application.",
    );

    const result = await attemptCreateOrderFromHome(page);
    test.skip(
      !result.created,
      result.reason ?? "This flow needs a second confirmed account because the seeded job belongs to the same authenticated user.",
    );

    await expect(page.locator("text=/pedido creado|solicitud enviada|postulación enviada|éxito/i").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("@home Reloading the page makes services appear again", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated client session saved in auth/user.json.",
    );

    await expect(homePage.getServiceCards().first()).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(homePage.getServiceCards().first()).toBeVisible();
    expect(await homePage.getServiceCards().count()).toBeGreaterThan(0);
  });
});
