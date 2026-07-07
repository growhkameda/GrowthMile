# GROWTH MILE

Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / Prisma / NextAuth.js / PostgreSQL を採用した受託開発プロジェクトです。
プロジェクトの全体像・規約・AI エージェントの役割分担は [`AGENTS.md`](AGENTS.md) と [`CLAUDE.md`](CLAUDE.md) を参照してください。

## ディレクトリ構成

すべて `src/` 配下に集約された Next.js モノリス構成です。

- `src/app/` — App Router のページ・レイアウト・API Routes
- `src/components/` — 共有 React コンポーネント
- `src/features/` — 機能別モジュール（UI + ロジック）
- `src/lib/` — Prisma クライアント、NextAuth 設定、共通ユーティリティ
- `prisma/` — Prisma スキーマ定義・マイグレーション
- `public/` — 静的アセット
- `e2e/` — Playwright E2E テスト（npm workspace 外の独立パッケージ）
- `docs/` — 要件定義・設計書・運用ガイド
- `scripts/` — エビデンス収集・ユーティリティ
- `.github/` — GitHub Actions ワークフロー、PR / Issue テンプレ、CODEOWNERS

## セットアップ

前提: Node.js 24（`.nvmrc` 参照）と Docker がインストール済みであること。

### 1. 依存関係インストール

```bash
npm install
cd e2e && npm install && cd ..
```

`e2e/` は workspace 外のため、ルートと別に個別インストールが必要です。

### 2. 環境変数

[`.env.example`](.env.example) をコピーして `.env` を作成し、`DATABASE_URL` / `AUTH_SECRET`（必要に応じて `AUTH_URL`）を設定してください。
`AUTH_SECRET` は `openssl rand -base64 32` などで 32 文字以上を生成します（Auth.js v5 の正式名。旧 `NEXTAUTH_*` もフォールバックで動作します）。

### 3. ローカル DB 起動 と マイグレーション

```bash
docker compose up -d db
npx prisma migrate dev
npx prisma generate
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリを確認できます。

## 主要コマンド

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー（`next dev`） |
| `npm run build` | 本番ビルド（`next build`） |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npm run format` | Prettier 自動修正 |
| `npm run format:check` | Prettier チェックのみ（CI 用） |
| `npm run test` | Vitest によるユニットテスト |
| `cd e2e && npx playwright test` | Playwright E2E テスト |

## Git リモート（GitHub・SSH）

```bash
git remote add origin git@github.com:growhkameda/GrowthMile.git
```

既に `origin` が設定済みの場合は次で差し替えてください。

```bash
git remote set-url origin git@github.com:growhkameda/GrowthMile.git
git remote -v
```

CI で使用するシークレットは GitHub の **Settings → Secrets and variables → Actions** に登録します。
登録すべき値の一覧は [`docs/ai/pending-setup.md`](docs/ai/pending-setup.md) を参照してください。

## CI/CD

GitHub Actions のメインワークフローは [`.github/workflows/ci.yml`](.github/workflows/ci.yml) です（lint / validate / test / security / e2e / deploy）。
SAST は [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml) の CodeQL で実施します。

## ドキュメント

- 要件・設計の規約: [`AGENTS.md`](AGENTS.md)
- アーキテクチャ: [`docs/architecture/`](docs/architecture/)
- インフラ構成: [`docs/architecture/spec-infrastructure.md`](docs/architecture/spec-infrastructure.md)
- 未確定の設定一覧: [`docs/ai/pending-setup.md`](docs/ai/pending-setup.md)
