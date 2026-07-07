# AGENTS.md (AI Development Context)

このファイルは、Claude Code が「GROWTH MILE」プロジェクトの全体像を把握するための共通コンテキストファイルです。
詳細ルールは `.claude/rules/`（`core-*` = 汎用 / `project-*` = 固有）に分割されています。

## 1. プロジェクト基本情報

- **Project Name**: GROWTH MILE
- **技術スタック**: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / Prisma / Auth.js v5 / PostgreSQL / Zod / Zustand (UI状態) / Prettier / Vitest + Testing Library / Playwright / GitHub Actions
- [INFO] **推測で実装せず、必ず以下のドキュメントを検索・参照すること**:
  - アーキテクチャ決定記録（ADR）: `docs/architecture/decisions/`
  - API 仕様・DB 設計: `docs/api/` , `docs/design/`
  - セキュリティ仕様: `docs/guides/security.md`

### ディレクトリ構造

Next.js モノリス構成。`frontend/` / `backend/` の分離はなく、すべて `src/` 配下に統合。

- `src/app/`: App Router（ページ・レイアウト・API Routes）
- `src/components/`: 共有 React コンポーネント
- `src/features/`: 機能別モジュール（UI + ロジック）
- `src/lib/`: Prisma クライアント・Auth 設定・共通ユーティリティ
- `prisma/`: Prisma スキーマ・マイグレーション
- `e2e/`: Playwright E2E テスト（npm workspace 外の独立パッケージ）
- `docs/`: 要件定義・設計書・規約・テンプレート・エビデンス
- `scripts/`: エビデンス収集・納品用スクリプト
- `.claude/`, `.github/`: エージェント・CI/CD 設定

## 2. AIエージェントの役割

Claude Code（CLI）が唯一のAIエージェントとして以下を担当する:

- 要件定義・設計書の作成（`.claude/workflows/requirement-review-loop.md`）
- UIデザインモックアップの作成（`.claude/workflows/design-mock.md`）
- 機能実装・ビルド・テスト検証・Git コミット・Prisma マイグレーション

禁止事項・エスカレーション基準は `.claude/rules/core-guardrails.md` を参照（無断のパッケージ追加・スキーマ変更・構造変更・秘密情報ハードコードの禁止等）。

## 3. Development Workflow & Commands

開発は `.claude/workflows/` に定義されたフェーズと品質ゲートに従って進む（全体像: `full-dev-cycle.md`）。
コマンドの正は `.claude/rules/project-ops.md`。代表例:

```bash
npm run dev / npm run build / npm run test / npm run lint / npm run format
npx prisma migrate dev / npx prisma generate
docker compose up -d db
cd e2e && npx playwright test
npx markdownlint-cli "docs/**/*.md" --fix
```

**npm workspace の注意**: `e2e/` は workspace 外の独立パッケージ。root で `npm ci` した後、`cd e2e && npm ci` を個別に実行する。

## 4. SubAgents & Skills

### SubAgents（コンテキスト分離・自動委任）

| SubAgent | 呼び出し場面 | ティア |
| --- | --- | --- |
| `build-verifier` | Lint・型・テスト・ビルドの一括検証（コード変更後必須） | `default` |
| `code-reviewer` | コードレビュー・セキュリティ監査（コード変更後必須） | `escalation` |
| `plan-reviewer` | COMPLEX タスクの実装計画の批評（`deep-plan` 後・実装前） | `escalation` |

### Skills（手順実行）

| スキル | 呼び出し場面 |
| --- | --- |
| `deep-plan` | COMPLEX 判定タスクの実装前に構造化計画を作成するとき |
| `implement-feature` | 設計書をもとに機能実装するとき |
| `self-review` | 完了報告前の自己批評（STANDARD 以上のタスクで必須） |
| `incident-response` | バグ調査・障害対応・根本原因分析をするとき |
| `rework-report` | E2E / ST 失敗・NEEDS_HUMAN_REVIEW 時に Evidence Bundle を保存するとき |
| `frontend-design` | 新規 UI のビジュアルデザインを検討するとき |
| `slide-design-themes` | スライド資料を作成するとき（tech-dark / enterprise-light をユーザーに選択させる） |
| `dev-diagrams` | アーキテクチャ図・ER図・シーケンス図・画面遷移図・フローチャートを作成するとき |

タスク受領時は `.claude/rules/core-cognition.md` の複雑度トリアージ（LIGHT / STANDARD / COMPLEX）を必ず実施し、判定に応じたプロセスを適用する。

## 5. Model Selection（ティア運用・バージョン固定しない）

**SSOT**: `docs/agentic/model-policy.md` / 運用ルール: `.claude/rules/core-ai-workflow.md`

| ティア | ファミリ | 用途 |
| --- | --- | --- |
| `default` | Sonnet 最新 | 実装・設計書・ビルド・一般 QA（タスクの 80-90%） |
| `escalation` | Opus 最新 | 計画レビュー・コードレビュー・セキュリティ・深いデバッグ・大規模リファクタリング |
| `fast` | Haiku 最新 | 探索・ファイル検索 |

メインモデルは `opusplan` 設定（Plan Mode = Opus / 実行 = Sonnet の自動切替）。COMPLEX タスクの計画は Plan Mode で行うことを推奨する。

## 6. Coding Standards（要点）

- 命名・実装パターン: `.claude/rules/project-stack.md`（camelCase / PascalCase / `any` 禁止 / `"use client"` 最小限 / Zod 必須 / カスタムエラークラス）
- 設計原則・デザインパターン: `.claude/rules/core-architecture.md`
- バックエンド堅牢性: `.claude/rules/core-backend.md`
- コミットは Conventional Commits（英語）。Husky の pre-commit / commit-msg フックが自動実行される
