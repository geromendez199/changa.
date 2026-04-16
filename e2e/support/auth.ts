import path from "node:path";
import { type Page, test } from "@playwright/test";

export const AUTH_PATHS = {
  user: path.resolve(process.cwd(), "auth/user.json"),
  provider: path.resolve(process.cwd(), "auth/provider.json"),
} as const;

export async function hasSupabaseSession(page: Page) {
  try {
    return await page.evaluate(() => {
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
  } catch {
    return false;
  }
}

export async function skipIfMissingSession(page: Page, reason: string) {
  const hasSession = await hasSupabaseSession(page);
  test.skip(!hasSession, reason);
}
