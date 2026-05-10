# @AGENTS.md

# CLI向けエージェント設定 (CLAUDE.md)

このプロジェクトの全体コンテキスト、アーキテクチャ、AIエージェントの役割分担についての最新のガイドラインは、プロジェクトルートの `AGENTS.md` に記載されています。
上記のメタタグにより、本設定ファイルとあわせて `AGENTS.md` も読み込まれます。

## WHAT (技術スタック・プロジェクト構造)

- **Project Name**: GROWTH MILE
- **技術スタック**: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / Prisma / NextAuth.js (Auth.js v5) / PostgreSQL / Zod / Zustand (UI状態) / Prettier / Vitest + Testing Library / Playwright
- **構造**: `src/` (app, components, features, lib), `prisma/`, `docs/`, `e2e/`

## Detail (プロジェクト詳細)
- 

## HOW (主要コマンド・規約)

- **アプリ起動**: `npm run dev`
- **ビルド**: `npm run build`
- **テスト**: `npm run test`（Vitest）
- **Lint**: `npm run lint`（ESLint）
- **フォーマット**: `npm run format`（Prettier 自動修正）
- **フォーマットチェック**: `npm run format:check`（CI 用、修正なし）
- **DB マイグレーション**: `npx prisma migrate dev`
- **Prisma 型生成**: `npx prisma generate`
- **ローカル DB 起動**: `docker compose up -d db`
- **E2Eテスト実行**: `cd e2e && npx playwright test`（アプリ起動中に実行）
- **E2E lock ファイル再生成**: `cd e2e && npm install --no-audit`（`e2e/` は workspace 外のため個別管理）
- **Root lock ファイル再生成**: `npm install --no-audit`（ルートの依存関係変更時）
- **コーディング規約**: キャメルケース（関数/変数）、パスカルケース（コンポーネント/クラス）、`any` 型禁止、`"use client"` は必要最小限
- **モデル選定**: デフォルトは `claude-sonnet-4-6`。大規模リファクタリング・セキュリティ審査・深いデバッグは `claude-opus-4-6` へエスカレーション。詳細は `AGENTS.md` セクション6を参照。
- 詳細な運用・ワークフローは `.cursor/workflows/` および `.cursor/rules/` を参照すること。
- **ルール・スキル・ワークフローの完全実行（省略禁止）**: トークン消費量・コンテキスト圧迫を理由に、定義されたルール・SubAgent・スキル・ワークフローを省略・簡略化・後回しにすることを禁止する。「コストを抑えるため省略します」「必要があれば実行します」は禁止。
  - コード変更後は必ず `build-verifier`（Lint・ビルド・テスト）と `code-reviewer`（Opus）を起動し、結果が揃ってからユーザーに報告する
  - FAIL / NEEDS_HUMAN_REVIEW 時は必ず `rework-report` スキルを起動してエビデンスを保存する
  - ワークフロー（`implement-and-verify.md` 等）の各ステップはすべて実行する
- **失敗・差し戻し発生時（ローカル・CI どちらも対象）**: 以下のいずれかが発生した場合は、必ず `.claude/skills/rework-report/SKILL.md` スキルを起動し、Evidence Bundle を `docs/evidence/` 配下に保存してからユーザーに報告すること。
  - ローカル Bash コマンド（`docker compose exec`・`npm run test` 等）が非ゼロで終了した
  - 会話上で CI パイプライン失敗・E2E 失敗・ビルドエラーが観測された（コマンドが失敗しなくてもログや報告から失敗が分かった場合も含む）
  - `code-reviewer` が FAIL / NEEDS_HUMAN_REVIEW を返した
  - **「後で保存する」「今回は省略する」は禁止。失敗を観測した直後に保存すること。**
- **禁止行為**: .env / .env.* ファイルの内容を AI が自動探索・解析しないこと。必要な値は人間が明示的にチャットへ貼る。パス探索も最小限に留める。
