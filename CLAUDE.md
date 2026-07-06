# @AGENTS.md

# Claude Code 設定 (CLAUDE.md)

プロジェクトの全体コンテキストは `AGENTS.md`（上記メタタグで自動読込）、詳細ルールは `.claude/rules/` に分割されています。

**このプロジェクトは Claude Code が唯一のAIエージェントとして全工程（要件定義・設計・実装・検証・コミット）を担当します。**

## WHAT（プロジェクト）

- **Project Name**: GROWTH MILE
- **技術スタック**: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / Prisma / Auth.js v5 / PostgreSQL / Zod / Zustand / Vitest / Playwright
- 詳細: `.claude/rules/project-stack.md`

## HOW（コマンド・ルール構成）

- 主要コマンド: `.claude/rules/project-ops.md` を参照（起動 `npm run dev` / テスト `npm run test` / ビルド `npm run build`）
- ルールは2層構成:
  - `.claude/rules/core-*.md` — 汎用（原則・ガードレール・設計・堅牢性・テスト・セキュリティ・ドキュメント・Git/CI・AIワークフロー）
  - `.claude/rules/project-*.md` — このプロジェクト固有（スタック・コマンド・CI）
- 開発フェーズの手順: `.claude/workflows/`（`full-dev-cycle.md` が全体像）

## 絶対遵守（要点）

- **タスク受領時に複雑度トリアージ（LIGHT / STANDARD / COMPLEX）を宣言する。COMPLEX は `deep-plan` → `plan-reviewer` を経てから実装、STANDARD 以上は完了報告前に `self-review` を実行する**（`core-cognition.md`）
- **コード変更後は必ず `build-verifier`（default / Sonnet 最新）と `code-reviewer`（escalation / Opus 最新）を起動し、両方の結果が揃ってから報告する**
- **破壊的変更（API シグネチャ・DB スキーマ・import パス・認証ロジック）は自分で判断せず必ずエスカレーションする**
- **E2E / ST 失敗・NEEDS_HUMAN_REVIEW 時は `rework-report` スキルで Evidence Bundle を `docs/evidence/` に保存してから報告する**（ローカルの lint / build / unit test 失敗はその場で修正、保存不要）
- **定義されたルール・SubAgent・スキル・ワークフローの省略・簡略化・後回し禁止**
- **`.env` / `.env.*` の自動探索・解析禁止**（必要な値は人間がチャットに貼る）
- モデルはティア運用でバージョン固定しない（SSOT: `docs/agentic/model-policy.md`）
