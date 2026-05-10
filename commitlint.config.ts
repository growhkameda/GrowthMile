import type { UserConfig } from "@commitlint/types"

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新機能
        "fix", // バグ修正
        "docs", // ドキュメントのみの変更
        "style", // コードの意味に影響しない変更（空白、フォーマット等）
        "refactor", // バグ修正・機能追加を伴わないリファクタリング
        "test", // テストの追加・修正
        "chore", // ビルドプロセスや補助ツールの変更
        "perf", // パフォーマンス改善
        "ci", // CI設定の変更
        "revert", // コミットの取り消し
      ],
    ],
    "subject-case": [0], // 日本語コミットメッセージを許可
  },
}

export default config
