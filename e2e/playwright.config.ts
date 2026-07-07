import { defineConfig, devices } from "@playwright/test"

// E2E 設定。networkidle 待ちは使用禁止（.claude/rules/core-testing.md）。
// URL・要素表示の明示的アサーションで安定化する。
// @playwright/test のバージョンは CI の mcr.microsoft.com/playwright イメージと厳密一致させること。
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit-results.xml" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // アプリ未起動なら dev サーバーを自動起動する（起動済みならそれを再利用）。
  // CI ではワークフロー側が build + start で事前起動するため、reuse で検知して二重起動を防ぐ。
  webServer: {
    command: "npm run dev",
    cwd: "..",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
