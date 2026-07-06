# プロジェクト固有ルール: コマンド・CI 運用

> [WARN] プロジェクト固有ルール。別プロジェクトへ流用する際は、コマンド・CI 構成を書き換える。

## 主要コマンド

```bash
npm run dev           # アプリ起動
npm run build         # プロダクションビルド
npm run test          # ユニットテスト（Vitest）
npm run lint          # ESLint
npm run format        # Prettier 自動修正
npm run format:check  # Prettier チェック（CI 用）
npx tsc --noEmit      # TypeScript 型チェック
npx prisma migrate dev  # DB マイグレーション
npx prisma generate     # Prisma 型生成
docker compose up -d db # ローカル DB 起動
npx markdownlint-cli "docs/**/*.md" --fix  # ドキュメント Lint（docs 更新後必須）
```

## E2E テスト（Playwright）

```bash
cd e2e && npx playwright test   # アプリ起動中に実行
```

- `e2e/` はルート `package.json` の workspaces に含まれない**独立パッケージ**
- `e2e/package-lock.json` は git に必ずコミットする。依存変更後は `cd e2e && npm install --no-audit` で再生成する
- CI では `npm ci`（root）の後に必ず `cd e2e && npm ci` を実行する
- `@playwright/test` のバージョンは caret なしで固定し、CI の `mcr.microsoft.com/playwright:vX.Y.Z-noble` イメージと完全一致させる（`core-git-cicd.md` 参照）

## CI パイプライン（.github/workflows/ci.yml）

| 分類 | 実ジョブ名 |
| --- | --- |
| Lint | `lint-markdown` / `format-check` / `lint-nextjs` |
| ドキュメント検証 | `check-ai-laziness`（未解決プレースホルダー検知）/ `check-links` / `check-doc-structure` / `doc-quality-report` |
| テスト・ビルド | `unit-test`（Vitest）/ `build-nextjs` |
| セキュリティ | `secrets-scan`（gitleaks）/ `hardcoded-credentials` |
| E2E | `detect-e2e` / `e2e-playwright` |
| デプロイ | `deploy-staging`（main push）/ `deploy-production`（workflow_dispatch・人間の手動トリガーのみ） |
| 図生成 | `generate-diagrams`（Mermaid PNG 生成。廃止候補・削除する場合はジョブごと除去） |

## 参照ドキュメント

- モデルポリシー（SSOT）: `docs/agentic/model-policy.md`
- ドキュメントテンプレート: `docs/templates/`
- セキュリティガイド: `docs/guides/security.md`
