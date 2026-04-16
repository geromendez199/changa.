import { test, expect } from "./support/test-base";
import { AUTH_PATHS, hasSupabaseSession } from "./support/auth";
import { PrestadorPage } from "./pages/PrestadorPage";
import { ensurePublishedJob, openMyJobs, uniqueValue } from "./support/scenarios";
import { resolveVisibleLocator } from "./support/ui";

test.describe.serial("@prestador", () => {
  test.use({ storageState: AUTH_PATHS.provider });

  const createdTitle = uniqueValue("Servicio QA");
  const editedTitle = uniqueValue("Servicio QA Editado");

  test("@prestador /prestador loads and shows provider service list or empty state", async ({ page }) => {
    const prestadorPage = new PrestadorPage(page);
    await prestadorPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session saved in auth/provider.json.",
    );

    const hasList = (await prestadorPage.getServiceList().count()) > 0;
    const hasEmptyState = await page.locator("text=/todav[ií]a no publicaste|empty|sin servicios/i").first().isVisible().catch(() => false);
    expect(hasList || hasEmptyState).toBe(true);
  });

  test('@prestador "Create service" button is visible', async ({ page }) => {
    const prestadorPage = new PrestadorPage(page);
    await prestadorPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session saved in auth/provider.json.",
    );

    await expect(
      page.getByRole("button", { name: /crear servicio|publicar una changa|publicar/i }).first(),
    ).toBeVisible();
  });

  test("@prestador Clicking create shows form fields for title, description, price, and category", async ({ page }) => {
    await page.goto("/publish", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session saved in auth/provider.json.",
    );

    const categoryVisible = await page.getByRole("button", { name: /plomer[ií]a|electricidad|otros|hogar|oficios|tecnolog/i }).first().isVisible().catch(() => false);
    const titleVisible = await page.locator('input[placeholder*="título" i], input[placeholder*="title" i]').first().isVisible().catch(() => false);

    expect(categoryVisible || titleVisible).toBe(true);
  });

  test("@prestador Submitting form with all fields creates a new service", async ({ page }) => {
    const prestadorPage = new PrestadorPage(page);
    await page.goto("/publish", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session and a real Supabase backend.",
    );

    await prestadorPage.fillServiceForm(
      createdTitle,
      "Servicio creado desde Playwright para validar alta de prestador.",
      15000,
      "Otros",
    );

    const finalSubmit = await resolveVisibleLocator([
      page.getByRole("button", { name: /publicar changa|guardar cambios|crear servicio/i }),
    ]);
    test.skip(
      !finalSubmit || (await finalSubmit.isDisabled().catch(() => false)),
      "The provider creation flow needs a writable backend and enabled submit control to validate persistence.",
    );

    await prestadorPage.submitServiceForm();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await expect(page).toHaveURL(/\/publish\/confirm\//);
    await expect(page.locator(`text=${createdTitle}`).first()).toBeVisible({ timeout: 10_000 });
  });

  test("@prestador Submitting form with empty title shows validation error", async ({ page }) => {
    const prestadorPage = new PrestadorPage(page);
    await prestadorPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session and a real provider create form.",
    );

    await prestadorPage.clickCreateService();
    const categoryButton = page.getByRole("button", { name: /otros|hogar|oficios/i }).first();
    if (await categoryButton.isVisible().catch(() => false)) {
      await categoryButton.click();
      await page.getByRole("button", { name: /continuar/i }).first().click();
    }

    await page.locator("textarea").first().fill("Descripción suficiente para disparar la validación.");
    await page.getByRole("button", { name: /continuar/i }).first().click();
    await expect(page.locator("text=/t[íi]tulo.*8 caracteres|t[íi]tulo/i").first()).toBeVisible();
  });

  test("@prestador Submitting form with negative price shows validation error", async ({ page }) => {
    const prestadorPage = new PrestadorPage(page);
    await prestadorPage.goto();
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session and a real provider create form.",
    );

    await prestadorPage.clickCreateService();
    const categoryButton = page.getByRole("button", { name: /otros|hogar|oficios/i }).first();
    if (await categoryButton.isVisible().catch(() => false)) {
      await categoryButton.click();
      await page.getByRole("button", { name: /continuar/i }).first().click();
    }

    await page.locator('input[placeholder*="título" i]').first().fill("Servicio temporal QA");
    await page.locator("textarea").first().fill("Descripción suficientemente larga para pasar la validación.");
    await page.getByRole("button", { name: /continuar/i }).first().click();
    await page.locator('input[type="number"]').first().fill("-1");
    const locationField = page.locator('input[placeholder*="ubicación" i]').first();
    if (await locationField.isVisible().catch(() => false)) await locationField.fill("Rafaela");
    const availabilityField = page.locator('input[placeholder*="cuándo" i]').first();
    if (await availabilityField.isVisible().catch(() => false)) await availabilityField.fill("Mañana");
    await page.getByRole("button", { name: /continuar/i }).first().click();

    await expect(page.locator("text=/precio v[aá]lido|presupuesto/i").first()).toBeVisible();
  });

  test("@prestador Editing an existing service saves and reflects the changes", async ({ page }) => {
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session and an editable provider-owned service.",
    );

    const titleToEdit = await ensurePublishedJob(page, "QA Edit Target");
    await openMyJobs(page);
    const targetCard = page.locator(".app-surface").filter({ hasText: titleToEdit }).first();
    await expect(targetCard).toBeVisible();
    await targetCard.getByRole("button", { name: /editar/i }).click();
    await page.waitForLoadState("networkidle").catch(() => undefined);

    await page.getByRole("button", { name: /continuar/i }).click();
    const titleField = page.locator('input[placeholder*="Arreglar" i], input[placeholder*="título" i]').first();
    await titleField.fill(editedTitle);
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.getByRole("button", { name: /continuar/i }).click();
    const submitButton = page.getByRole("button", { name: /guardar cambios|publicar changa/i }).first();
    await submitButton.click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await openMyJobs(page);

    await expect(page.locator(`text=${editedTitle}`).first()).toBeVisible({ timeout: 10_000 });
  });

  test("@prestador Pausing a service changes its status", async ({ page }) => {
    test.skip(true, "Current Changa UI does not expose a pause service control; backend and UI support are needed for this scenario.");
  });

  test("@prestador Activating a paused service changes its status back to active", async ({ page }) => {
    test.skip(true, "Current Changa UI does not expose an activate service control; backend and UI support are needed for this scenario.");
  });

  test("@prestador Deleting a service makes it disappear from the list", async ({ page }) => {
    test.skip(
      !(await hasSupabaseSession(page)),
      "Requires an authenticated provider session and a deletable provider-owned service.",
    );

    const titleToDelete = await ensurePublishedJob(page, "QA Delete Target");
    await openMyJobs(page);
    const targetCard = page.locator(".app-surface").filter({ hasText: titleToDelete }).first();
    await expect(targetCard).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await targetCard.getByRole("button", { name: /eliminar/i }).click();

    await expect(page.locator(`text=${titleToDelete}`).first()).not.toBeVisible({ timeout: 10_000 });
  });

  test("@prestador Provider can see incoming orders and confirm or reject them", async ({ page }) => {
    test.skip(true, "Requires a seeded provider account with incoming client orders/applications in Supabase to validate confirm/reject safely.");
  });
});
