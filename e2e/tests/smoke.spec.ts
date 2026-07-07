import { test, expect } from "@playwright/test"

// スモークテスト: アプリが起動しトップページが描画されることを確認する。
// 機能実装が進んだら、主要ユーザーフローの E2E をここに追加していく。
test.describe("smoke", () => {
  test("トップページが正常に表示される", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator("body")).toBeVisible()
  })
})
