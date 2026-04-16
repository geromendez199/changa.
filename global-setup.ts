import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type FullConfig, type Page } from "@playwright/test";

const DEFAULT_BASE_URL = "https://changa-three.vercel.app";
const AUTH_DIR = path.resolve(process.cwd(), "auth");
const USER_STATE_PATH = path.join(AUTH_DIR, "user.json");
const PROVIDER_STATE_PATH = path.join(AUTH_DIR, "provider.json");

async function ensureStorageStateFile(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
}

async function fillLoginForm(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"], input[placeholder*="Email" i]').first().fill(email);
  await page
    .locator('input[type="password"], input[placeholder*="Contraseña" i], input[placeholder*="Password" i]')
    .first()
    .fill(password);
  await page.getByRole("button", { name: /entrar|ingresar|iniciar sesi[oó]n/i }).first().click();
}

async function hasSupabaseToken(page: Page) {
  return page.evaluate(() => {
    const keys = Object.keys(window.localStorage);
    return keys.some((key) => {
      const raw = window.localStorage.getItem(key);
      return (
        (key.toLowerCase().includes("auth-token") || key.toLowerCase().startsWith("sb-")) &&
        typeof raw === "string" &&
        raw.length > 0
      );
    });
  });
}

async function loginAndSaveState(
  browserBaseURL: string,
  outputPath: string,
  email: string | undefined,
  password: string | undefined,
) {
  await ensureStorageStateFile(outputPath);

  if (!email || !password) {
    console.warn(`[global-setup] Skipping auth bootstrap for ${outputPath}; missing credentials.`);
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: browserBaseURL });
  const page = await context.newPage();

  try {
    await fillLoginForm(page, email, password);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page
      .waitForFunction(
        () => {
          const keys = Object.keys(window.localStorage);
          return keys.some((key) => {
            const raw = window.localStorage.getItem(key);
            return (
              key.toLowerCase().includes("supabase") &&
              key.toLowerCase().includes("auth") &&
              typeof raw === "string" &&
              (raw.includes("access_token") || raw.includes("refresh_token") || raw.includes("currentSession"))
            );
          });
        },
        undefined,
        { timeout: 15_000 },
      )
      .catch(() => undefined);

    const hasSession = await hasSupabaseToken(page);
    const currentUrl = page.url();

    if (/\/login(?:\?|$)/.test(currentUrl)) {
      const errorCopy = await page
        .locator("text=/incorrect|inv[aá]lido|no se pudo|error|contrase[aá]s? no coinciden|registrado/i")
        .first()
        .textContent()
        .catch(() => null);
      throw new Error(errorCopy ?? `Login did not produce an authenticated session. Current URL: ${currentUrl}`);
    }

    if (!hasSession) {
      console.warn(`[global-setup] Login reached ${currentUrl} but no localStorage token was detected. Saving storage state anyway.`);
    }

    await context.storageState({ path: outputPath });
  } catch (error) {
    console.warn(`[global-setup] Could not persist auth state for ${outputPath}:`, error);
    await ensureStorageStateFile(outputPath);
  } finally {
    await context.close();
    await browser.close();
  }
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL?.toString() ?? process.env.BASE_URL ?? DEFAULT_BASE_URL;
  const providerEmail = process.env.TEST_PROVIDER_EMAIL ?? process.env.TEST_EMAIL;
  const providerPassword = process.env.TEST_PROVIDER_PASSWORD ?? process.env.TEST_PASSWORD;

  await fs.mkdir(AUTH_DIR, { recursive: true });
  await Promise.all([
    loginAndSaveState(baseURL, USER_STATE_PATH, process.env.TEST_EMAIL, process.env.TEST_PASSWORD),
    loginAndSaveState(baseURL, PROVIDER_STATE_PATH, providerEmail, providerPassword),
  ]);
}
