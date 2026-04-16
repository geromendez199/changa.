import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "https://changa-three.vercel.app";
const includeOptionalBrowsers = process.env.PW_OPTIONAL_BROWSERS === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  globalSetup: "./global-setup.ts",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["./reporters/error-reporter.ts"],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
    ...(includeOptionalBrowsers
      ? [
          {
            name: "firefox",
            use: {
              ...devices["Desktop Firefox"],
              browserName: "firefox",
            },
          },
          {
            name: "webkit",
            use: {
              ...devices["Desktop Safari"],
              browserName: "webkit",
            },
          },
        ]
      : []),
  ],
});
