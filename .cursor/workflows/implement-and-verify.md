---
description: "実装 → ビルド → テスト → レビューループ ワークフロー"
---

# 実装 → ビルド → テストループ

Claude Code が機能を実装し、ビルド・テスト・コードレビューまでを一貫して行う自動ループ。
破壊的変更や PR は人間の承認を経由します。

## 前提条件

- 対象機能の仕様書（`docs/features/*.md`）が PASS 済みであること
- `CLAUDE.md` を読み、アーキテクチャを把握済み
- コーディング規約を確認済み

## ワークフロー

### Step 1: 実装（Claude Code）

1. 対象機能の仕様書（`docs/features/*.md`）を読み込む
2. 以下のルールに従って実装する：
   - ページ・レイアウト: `src/app/` 配下に App Router 規約で配置
   - コンポーネント: `src/components/` または `src/features/<機能名>/` 配下に配置
   - API Routes: `src/app/api/<リソース名>/route.ts` として実装
   - DB アクセス: `src/lib/` 配下で Prisma クライアントを使用
   - 型定義を必ず作成（`any` 禁止、Prisma 生成型を優先使用）
   - カスタムエラークラスを使用
3. 新規 API を追加した場合は `docs/api/spec-api.md` を更新
4. DB 変更がある場合は `prisma/schema.prisma` と `docs/design/spec-db.md` を更新

### Step 2: ビルド＆テスト検証（Claude Code または Terminal）

ターミナルで以下を自ら実行、またはユーザーに依頼する：

> 「ビルドとテストを実行して検証レポートを出力して」
> 「直近の実装内容をレビューして結果を報告して」

### Step 3: 検証結果の確認と対応（Claude Code / Cursor）

それぞれの出力を読み、判定に応じて対応する：

- **PASS** → ユーザーに「ビルド・テスト・コードレビュー全てパスしました」と報告。Step 3.5 へ進む
- **FAIL（ビルドエラー）** → エラー内容を確認し、コードを修正。Step 2 に戻る
- **FAIL（テスト失敗）** → 失敗テストを確認し、コードを修正。Step 2 に戻る
- **FAIL（コードレビュー指摘）** → Major 指摘を修正。Step 2 に戻る
- **NEEDS_HUMAN_REVIEW** → ユーザーに該当箇所を提示

### Step 3.5: エビデンス収集（品質ゲート通過後）

ユーザーに以下の実行を依頼する（任意）：

> テストエビデンスを保存するため、ターミナルで以下を実行してください：
>
> ```bash
> bash scripts/collect-test-evidence.sh
> ```

### Step 4: コミット

全テストパス後、コミットメッセージ `feat: <機能名>の実装` でコミットして完了。

### Step 6: 完了処理

1. `docs/ai/task-queue.md` の該当タスクを「完了済み」に移動
2. `docs/agentic/PROGRESS.md` の進捗を更新
