# プロジェクト固有ルール: 技術スタック（Next.js / TypeScript）

> [WARN] プロジェクト固有ルール。別プロジェクトへ流用する際は、このファイルを `rules-library/` の該当スタックファイルで差し替えてカスタマイズする。

## 技術スタック

| 分類 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / TypeScript |
| スタイリング | Tailwind CSS v4 |
| ORM / DB | Prisma 7 / PostgreSQL |
| 認証 | Auth.js v5（NextAuth.js v5） |
| バリデーション | Zod（API Routes / Server Actions / env 全入力に必須） |
| UI グローバル状態 | Zustand（モーダル・通知等の純粋 UI 状態のみ） |
| フォーマット | Prettier + prettier-plugin-tailwindcss |
| コミットフック | Husky + lint-staged + commitlint |
| テスト | Vitest + Testing Library (UT) / Playwright (E2E) |

## 命名規則

- 関数・変数: `camelCase` / コンポーネント・クラス・Prisma モデル: `PascalCase`
- DB カラム名: `snake_case`（例: `created_at`）
- App Router のファイル名は Next.js 規約に従う（`page.tsx`, `layout.tsx`, `route.ts` 等）
- `any` 型禁止。Prisma の自動生成型を必ず使用する

## 実装パターン

### Server / Client Components の境界

`"use client"` は必要最小限にとどめる（バンドルサイズ増大と SSR の恩恵喪失を防ぐ）。
静的なコンポーネントはデフォルトの Server Component のままにする。

### 認証（Auth.js v5）

- Server Components では `auth()` を直接呼び出し、Client Components では `useSession()` を使用する
- 認証が必要なルートは `src/middleware.ts`（または `src/proxy.ts`）で一括保護する。Edge Runtime の制約上、Prisma を含む完全な Auth 設定は使えないため、Edge 互換の軽量設定 `src/auth.config.ts` を使用する
- 環境変数は `AUTH_SECRET` / `AUTH_URL` を使用する（旧 `NEXTAUTH_*` は使用しない）

### Prisma

- `src/lib/db.ts` のシングルトンクライアントを必ず使用する（Hot Reload によるコネクション枯渇防止）
- Prisma 7 では datasource の `url` を `schema.prisma` に書かず、`prisma.config.ts` で管理する

### API Routes / Server Actions

- 全入力を Zod でバリデーションする（`safeParse` → 失敗時 400 + `error.flatten()`）
- `NextResponse.json<ApiResponse<T>>()` で必ずレスポンス型を明示する
- カスタムエラークラスを使用し、適切な HTTP ステータスコードを返す

### 状態管理

- イイネ・フォロー等のサーバー状態変更は `useOptimistic` で即時 UI 反映し、Server Action で DB 更新する
- Zustand をサーバー状態管理に使わない

### 環境変数（t3-env パターン）

- `src/env.ts` で Zod スキーマにより定義し、起動時に型チェックする
- 環境変数への直接アクセス（`process.env.X`）はせず、`src/env.ts` 経由でアクセスする

## UI デザイン（プロジェクト固有トークン）

- デザイントークンの SSOT: `docs/design/spec-design-system.md`
- UI テキスト: `'Inter', 'Noto Sans JP', sans-serif` / 数値・ID・コード: `'JetBrains Mono', monospace`
- 形状: カード `12px` / ボタン `5-6px` / バッジ `4px` / アバター `50%` / ピル `20px`
- 色は必ず CSS 変数（`var(--accent)`, `var(--t1)` 等）を使用（`core-frontend.md` 参照）
- UI 機能仕様: `docs/design/spec-ui.md`
