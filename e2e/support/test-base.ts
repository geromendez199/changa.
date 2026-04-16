import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use, testInfo) => {
    const consoleErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(`[console.error] ${message.text()}`);
      }
    });

    page.on("pageerror", (error) => {
      consoleErrors.push(`[pageerror] ${error.message}`);
    });

    await use(consoleErrors);

    await testInfo.attach("current-url", {
      body: page.url() || "about:blank",
      contentType: "text/plain",
    });

    await testInfo.attach("console-errors", {
      body: consoleErrors.join("\n") || "No console errors captured.",
      contentType: "text/plain",
    });
  },
});

export { expect };
