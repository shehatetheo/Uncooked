import { defineConfig, devices } from "@playwright/test";

const { defaultBrowserType: _webkit, ...iphone } = devices["iPhone 14"];

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100", trace: "off" },
  webServer: { command: "npm run start -- -p 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1360, height: 850 } } },
    // iPhone viewport, touch and user agent on Chromium. Real Safari still needs a check on the phone.
    { name: "iphone", use: { ...iphone, browserName: "chromium" } },
  ],
});
