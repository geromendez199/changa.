import type { Page } from "@playwright/test";
import { test, expect } from "./support/test-base";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

async function installLcpObserver(page: Page) {
  await page.addInitScript(() => {
    (window as typeof window & { __PW_LCP__?: number }).__PW_LCP__ = 0;

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      (window as typeof window & { __PW_LCP__?: number }).__PW_LCP__ = lastEntry?.startTime ?? 0;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
}

test("@perf /home fully loads in under 5 seconds", async ({ page }) => {
  const startedAt = Date.now();
  const homePage = new HomePage(page);
  await homePage.goto();
  const durationMs = Date.now() - startedAt;

  expect(durationMs).toBeLessThan(5_000);
});

test("@perf /login loads in under 3 seconds", async ({ page }) => {
  const startedAt = Date.now();
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  const durationMs = Date.now() - startedAt;

  expect(durationMs).toBeLessThan(3_000);
});

test("@perf No resource takes more than 2 seconds to load individually", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const slowResources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => ({
        name: entry.name,
        duration: entry.duration,
      }))
      .filter((entry) => entry.duration > 2_000),
  );

  expect(slowResources, JSON.stringify(slowResources, null, 2)).toEqual([]);
});

test("@perf Capture and log LCP with PerformanceObserver", async ({ page }, testInfo) => {
  await installLcpObserver(page);
  const homePage = new HomePage(page);
  await homePage.goto();

  const lcp = await page.evaluate(() => (window as typeof window & { __PW_LCP__?: number }).__PW_LCP__ ?? 0);
  await testInfo.attach("lcp.txt", {
    body: `LCP(ms): ${lcp}`,
    contentType: "text/plain",
  });

  expect(lcp).toBeGreaterThan(0);
});
