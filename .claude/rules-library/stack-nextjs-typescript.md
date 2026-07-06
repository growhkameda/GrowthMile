# スタックルール: Next.js / TypeScript

> [INFO] 汎用スタックルールの原本。使用時は `rules/project-stack.md` へコピーし、プロジェクト固有情報（バージョン・デザイントークンのパス等）を追記する。

## 技術スタック（標準構成）

| 分類 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js (App Router) / TypeScript |
| スタイリング | Tailwind CSS |
| ORM / DB | Prisma / PostgreSQL |
| 認証 | Auth.js v5（NextAuth.js v5） |
| バリデーション | Zod（API Routes / Server Actions / env 全入力に必須） |
| UI グローバル状態 | Zustand（純粋 UI 状態のみ） |
| テスト | Vitest + Testing Library (UT) / Playwright (E2E) |

## 命名規則

- 関数・変数: `camelCase` / コンポーネント・クラス・Prisma モデル: `PascalCase`
- DB カラム名: `snake_case`
- App Router のファイル名は Next.js 規約に従う（`page.tsx`, `layout.tsx`, `route.ts` 等）
- `any` 型禁止。Prisma の自動生成型を必ず使用する

## 実装パターン

### Server / Client Components の境界

- `"use client"` は必要最小限にとどめる（バンドルサイズ増大と SSR の恩恵喪失を防ぐ）
- 静的なコンポーネントはデフォルトの Server Component のままにする

### 認証（Auth.js v5）

- Server Components では `auth()`、Client Components では `useSession()` を使用する
- 認証が必要なルートはミドルウェアで一括保護する。Edge Runtime の制約上、Edge 互換の軽量設定（`auth.config.ts`）を分離する
- 環境変数は `AUTH_SECRET` / `AUTH_URL` を使用する

### Prisma

- シングルトンクライアント（`lib/db.ts`）を必ず使用する（Hot Reload によるコネクション枯渇防止）

### API Routes / Server Actions

- 全入力を Zod でバリデーションする（`safeParse` → 失敗時 400 + `error.flatten()`）
- レスポンス型を必ず明示する（`NextResponse.json<ApiResponse<T>>()`）
- カスタムエラークラスを使用し、適切な HTTP ステータスコードを返す

### 状態管理

- サーバー状態の楽観的更新は `useOptimistic` + Server Action で行う
- Zustand をサーバー状態管理に使わない

### 環境変数（t3-env パターン）

- `env.ts` で Zod スキーマにより定義し、起動時に型チェックする
- `process.env.X` へ直接アクセスせず `env.ts` 経由でアクセスする

## ディレクトリ構成（標準）

```text
src/
├── app/          # App Router（ページ・レイアウト・API Routes）
├── components/   # 共有 React コンポーネント
├── features/     # 機能別モジュール（UI + ロジック）
└── lib/          # DB クライアント・認証設定・ユーティリティ
```
