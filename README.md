# GROWTH MILE

メンバー同士が称賛・感謝を送り合う社内向けアプリケーションです。日々の貢献をタイムラインで共有し、
称賛の蓄積がポイント（マイル）やガチャなどの楽しみに繋がることで、組織のポジティブな文化醸成を支援します。

技術スタックは Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / Prisma 7 / Auth.js v5 / PostgreSQL 16。
プロジェクトの全体像・開発規約・AI エージェント（Claude Code）の運用は [`AGENTS.md`](AGENTS.md) と [`CLAUDE.md`](CLAUDE.md) を参照してください。

## クイックスタート

前提: Node.js 24（[`.nvmrc`](.nvmrc)）と Docker がインストール済みであること。

```bash
npm install && (cd e2e && npm install)
cp .env.example .env          # AUTH_SECRET を設定（openssl rand -base64 32）
docker compose up -d db
npx prisma migrate dev
npm run dev                   # http://localhost:3000
```

つまずいた場合やより詳しい手順（SSH 設定・Claude Code・トラブルシューティング）は
**[開発環境構築・Git 運用手順書](docs/agentic/onboarding-setup-guide.pptx)** を参照してください。

## 主要コマンド

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` / `npm run format` | ESLint / Prettier 自動修正 |
| `npx tsc --noEmit` | TypeScript 型チェック |
| `npm run test` | ユニットテスト（Vitest） |
| `cd e2e && npx playwright test` | E2E テスト（アプリは自動起動） |
| `npx prisma migrate dev` | DB マイグレーション + Client 生成 |

## ディレクトリ構成

Next.js モノリス構成（アプリ本体は `src/` 配下に集約）。

- `src/app/` — App Router のページ・レイアウト・API Routes
- `src/components/` — 共有 React コンポーネント
- `src/features/` — 機能別モジュール（UI + ロジック）
- `src/lib/` — Prisma クライアント・共通ユーティリティ
- `src/generated/` — Prisma 生成物（git 管理外・`prisma generate` で生成）
- `src/env.ts` / `src/proxy.ts` / `src/auth.config.ts` — 環境変数検証・Middleware・Edge 用 Auth 設定
- `prisma/` — スキーマ定義・マイグレーション
- `shared/types/` — フロント・バック共有の型定義
- `e2e/` — Playwright E2E テスト（npm workspace 外の独立パッケージ）
- `public/` — 静的アセット
- `docs/` — 設計書・運用資料（下記「ドキュメント」参照）
- `scripts/` — エビデンス収集等のユーティリティ
- `.claude/` — Claude Code の規約・スキル・品質ゲート設定
- `.github/` — CI/CD ワークフロー・PR / Issue テンプレート

## コミット規約

形式は Conventional Commits（`<type>: <subject>`、subject は英語・命令形）。
commit 時に Husky が自動検査します（pre-commit: prettier + eslint ／ commit-msg: commitlint）。

| type | 用途 | type | 用途 |
| --- | --- | --- | --- |
| `feat` | 新機能の追加 | `chore` | ビルド・補助ツールの変更 |
| `fix` | バグ修正 | `style` | フォーマット等の変更 |
| `docs` | ドキュメントのみの変更 | `perf` | パフォーマンス改善 |
| `refactor` | 挙動を変えないコード改善 | `ci` | CI 設定の変更 |
| `test` | テストの追加・修正 | `revert` | コミットの取り消し |

運用ルール: main / develop へ直 push しない（feature ブランチ + PR）・1 コミット 1 論理変更・`git push --force` 禁止。
詳細は [コミットプレフィックス一覧](docs/agentic/git-commit-prefixes.pptx) を参照。

## ドキュメント

| 場所 | 内容 |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) ／ [`CLAUDE.md`](CLAUDE.md) | プロジェクト全体像・AI 駆動開発の規約（詳細は `.claude/rules/`） |
| [`docs/agentic/`](docs/agentic/) | モデルポリシー（SSOT）・オンボーディング手順書・コミット規約・.claude 構成資料 |
| [`docs/architecture/`](docs/architecture/) | アーキテクチャ概要・各種ダイアグラム（アプリ構成図・ER 図ほか）・インフラ仕様 |
| [`docs/design/mockups/`](docs/design/mockups/) | 画面デザインモックアップ（HTML） |
| [`docs/templates/`](docs/templates/) | 要件定義・API 仕様・DB 設計・ADR 等のテンプレート |
| [`docs/ai/pending-setup.md`](docs/ai/pending-setup.md) | CI Secrets など未設定項目の一覧 |
| `docs/api/` ／ `docs/features/` ／ `docs/guides/` | API 仕様・機能要件・ガイド（機能実装の進行に応じて追加） |

## CI/CD

GitHub Actions（[`ci.yml`](.github/workflows/ci.yml)）で Lint・ドキュメント検証・テスト・ビルド・
セキュリティスキャン・E2E を自動実行します（PR のマージには全ジョブの成功が必要）。
SAST は [`codeql.yml`](.github/workflows/codeql.yml)、本番デプロイは `workflow_dispatch` による手動トリガーのみです。
