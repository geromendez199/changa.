import type { Page } from "@playwright/test";
import { ROUTES } from "../support/constants";
import { gotoFirstAvailableRoute } from "../support/navigation";
import { clickFirstVisible, fillFirstVisible, resolveVisibleLocator } from "../support/ui";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await gotoFirstAvailableRoute(this.page, ROUTES.login);
  }

  async fillEmail(email: string) {
    await fillFirstVisible(
      [
        this.page.locator('input[type="email"]'),
        this.page.locator('input[placeholder*="Email" i]'),
        this.page.locator('input[aria-label*="email" i]'),
      ],
      email,
      "email",
    );
  }

  async fillPassword(password: string) {
    await fillFirstVisible(
      [
        this.page.locator('input[type="password"]'),
        this.page.locator('input[placeholder*="Contraseña" i]'),
        this.page.locator('input[placeholder*="Password" i]'),
      ],
      password,
      "password",
    );
  }

  async submit() {
    await clickFirstVisible(
      [
        this.page.getByRole("button", { name: /entrar|iniciar sesi[oó]n|ingresar/i }),
        this.page.locator('button:has-text("Entrar")'),
      ],
      "login submit",
    );
  }

  async getErrorMessage() {
    const locator = await resolveVisibleLocator([
      this.page.locator(
        "text=/incorrect|v[aá]lido|no se pudo|contrase[aá]a|registrado|coinciden|6 caracteres|error/i",
      ),
      this.page.locator('[role="alert"]'),
    ]);
    return locator ? (await locator.textContent())?.trim() ?? null : null;
  }
}
