# レビューチェックリスト

> **用途**: Claude Code がレビュー時に使用する統一チェックリスト。
> レビュー種別（要件定義 / コード / 設計書 / ビルド）に応じて該当セクションを使用してください。

---

## A. 要件定義レビュー

### A-1. 完全性

- [ ] すべての機能に「入力」「処理」「出力」が明記されている
- [ ] 画面構成（URL パス、レイアウト構造）が定義されている
- [ ] エラーケース・代替フローが記述されている
- [ ] 非機能要件（パフォーマンス、セキュリティ、可用性）が具体的な数値で定義されている
- [ ] 用語集が記載されている（専門用語を使用する場合）

### A-2. 具体性

- [ ] 禁止ワードが含まれていない（`.claude/rules/core-docs.md` の品質基準を参照）
- [ ] 曖昧表現がない（「〜など」「〜的な」「適切に」「必要に応じて」）
- [ ] 数値基準が明記されている（件数制限、文字数制限、タイムアウト値、同時接続数）
- [ ] ユーザーストーリーまたはユースケースが具体的

### A-3. 整合性

- [ ] `mvp_requirements.md` と `features/requirements.md` に矛盾がない
- [ ] 各機能仕様書（`features/*.md`）が要件定義の記述と一致
- [ ] API仕様書（`spec-api.md`）が要件定義の全機能をカバー
- [ ] DB設計書（`spec-db.md`）が要件定義のデータ要件を満たす
- [ ] `security.md` のセキュリティ要件と整合している

### A-4. テンプレート準拠

- [ ] `docs/templates/requirements-template.md` のフォーマットに従っている
- [ ] YAMLフロントマター（title, project, version, date, author）が含まれている
- [ ] 更新履歴セクションがある

---

## B. コードレビュー

### B-1. コーディング規約（`.claude/rules/project-stack.md` 準拠）

- [ ] 関数名: キャメルケース（TypeScript）
- [ ] コンポーネント名: パスカルケース（React）
- [ ] 定数: UPPER_SNAKE_CASE
- [ ] TypeScript: `any` 型の使用なし、適切な型定義あり（Prisma 生成型を優先）
- [ ] import文の整理（未使用importなし）

### B-2. アーキテクチャ準拠

- [ ] ページ・レイアウト: `src/app/` 配下に App Router 規約で配置
- [ ] API Routes: `src/app/api/<リソース名>/route.ts` で実装
- [ ] 機能別コンポーネント: `src/features/<機能名>/` 配下に配置
- [ ] 共通コンポーネント: `src/components/` 配下
- [ ] DB アクセス: `src/lib/db.ts` 経由（Prisma クライアントシングルトン）
- [ ] `"use client"` は必要最小限（Server Components がデフォルト）

### B-3. セキュリティ（`docs/guides/security.md` 準拠）

- [ ] 秘密鍵・APIキー・パスワード・トークンのハードコードなし
- [ ] `.env` が `.gitignore` に含まれている
- [ ] SQLインジェクション対策（Prisma クライアントを使用、生 SQL 禁止）
- [ ] XSS対策（React のデフォルトエスケープ、`dangerouslySetInnerHTML` 不使用）
- [ ] 全入力を Zod でバリデーション（API Routes / Server Actions）
- [ ] ログに個人情報（メール、パスワード、トークン）を含まない
- [ ] CORS設定が適切

### B-4. エラーハンドリング（`.claude/rules/project-stack.md` 準拠）

- [ ] カスタムエラークラス使用（生の `Error` を投げない）
- [ ] try-catch が適切に配置（空 catch 禁止）
- [ ] HTTPステータスコードが適切（200, 201, 400, 401, 403, 404, 500）
- [ ] API Routes は `NextResponse.json<ApiResponse<T>>()` で型付きレスポンス

### B-5. 破壊的変更の検出

- [ ] 既存APIシグネチャの変更なし（変更時は影響範囲を明記）
- [ ] 既存DBスキーマの変更なし（変更時はマイグレーション計画を提示）
- [ ] 既存importパスの変更なし
- [ ] 破壊的変更がある場合 → **必ず `NEEDS_HUMAN_REVIEW` にエスカレーション**

### B-6. ドキュメント同期

- [ ] 新規APIエンドポイント → `docs/api/spec-api.md` 更新済み
- [ ] DBスキーマ変更 → `docs/design/spec-db.md` 更新済み
- [ ] 機能追加 → 対応する `docs/features/*.md` と整合確認
- [ ] 進捗変更 → `docs/agentic/PROGRESS.md` 更新済み

---

## C. 設計書レビュー

### C-1. フォーマット（`.claude/rules/core-docs.md` 準拠）

- [ ] Markdown形式で記述
- [ ] エンドポイント一覧・テーブル一覧は表形式
- [ ] パラメータ定義に型・必須/任意・説明の列あり
- [ ] JSONサンプルは ` ```json ` コードブロックで記述
- [ ] ER図・フロー図は ` ```mermaid ` コードブロックで記述
- [ ] YAMLフロントマター（title, project, version, date, author）あり

### C-2. 品質

- [ ] 禁止ワードが含まれていない（A-2と同一基準）
- [ ] 仕様が具体的で、AIが自律的にコードを書ける精度
- [ ] 秘密情報（パスワード、APIキー、トークン）の実値記載なし
- [ ] テストデータに実在する個人情報なし

---

## D. ビルド＆テスト検証

### D-1. ビルド・型チェック

- [ ] `npm run build` 成功（TypeScript型エラーなし）
- [ ] `npm run lint` 成功（ESLintエラーなし）
- [ ] `npm run format:check` 成功（Prettierフォーマット準拠）
- [ ] 警告の確認（新規警告が増えていないか）

### D-2. テスト

- [ ] `npm run test` 全テストパス（Vitest）
- [ ] テストカバレッジの確認（カバレッジ設定がある場合）
- [ ] E2E テスト: `cd e2e && npx playwright test` 成功（実装している場合）

### D-3. ドキュメント

- [ ] `npx markdownlint-cli "docs/**/*.md"` エラーなし

### D-4. エビデンス

- [ ] テストエビデンスが `docs/evidence/build-test/` に保存されている
- [ ] AIレビューエビデンスが `docs/evidence/ai-reviews/` に保存されている
- [ ] 各エビデンスの `summary.md` が正しく生成されている

---

## 判定基準（共通）

| 判定                 | 条件                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `PASS`               | 全チェック項目クリア。指摘事項なし                                          |
| `PASS_WITH_NOTES`    | Minor指摘のみ（命名微調整、コメント追加推奨等）。次工程に進行可             |
| `FAIL`               | Major指摘あり（セキュリティ問題、設計違反、バグ等）。修正後に再レビュー必須 |
| `NEEDS_HUMAN_REVIEW` | 破壊的変更、方針判断、AIでは判断不可能な項目あり。人間の確認必須            |
