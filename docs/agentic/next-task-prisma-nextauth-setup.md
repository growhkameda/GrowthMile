# 次回タスク: Prisma / NextAuth 整合とローカル DB マイグレーション

Claude Code による初期スキャフォールディング後の検証結果と、続きの作業手順をここに集約する。

## 背景

ユーザー指示: `.env` に `DATABASE_URL` を設定 → `docker compose up -d db` → `npx prisma migrate dev`。

ただし **現状のリポジトリでは、マイグレーション実行前にスキーマと NextAuth の整合修正が必須**（下記ブロッカー参照）。

## ブロッカー（先に直す）

| 項目 | 内容 |
| --- | --- |
| Prisma `datasource` | `prisma/schema.prisma` に `url = env("DATABASE_URL")` が無い。`migrate dev` が正しく動かない。 |
| Prisma モデル | スキーマに `model` が無い。`PrismaAdapter(db)` 利用時は NextAuth 用モデル（User / Account / Session / VerificationToken 等）が必要。 |
| NextAuth の版と API | `package.json` は `next-auth` 4.x だが `src/lib/auth.ts` は v5 風の分割代入。依存とコードをどちらかに揃える。 |
| Auth Route | `src/app/api/auth/[...nextauth]/route.ts`（等）が未配線の可能性。App Router で認証エンドポイントを export する。 |

## 推奨作業順（実装側）

1. `prisma/schema.prisma` に `url = env("DATABASE_URL")` を追加。
2. NextAuth を **v5（Auth.js）に上げコードを維持**するか、**v4 にコードを合わせる**かを決め、一方に統一。
3. NextAuth + Prisma 公式に沿ったモデル定義を `schema.prisma` に追加。
4. `app/api/auth/[...nextauth]/route.ts` で `handlers` を export（v5 の場合）。
5. `src/env.ts` の `AUTH_SECRET` 最小長（32）を満たす `.env` を用意。

## ユーザー／ローカル手順（上記完了後）

1. `.env.example` を `.env` にコピーし、値を入力する。
   - `DATABASE_URL` 例（`docker-compose.yml` と整合）: `postgresql://user:password@localhost:5432/growth_mile_db`
   - `AUTH_SECRET`: `openssl rand -base64 32` 等で 32 文字以上を生成。
   - `AUTH_URL`: ローカルなら `http://localhost:3000`（Vercel など多くの PaaS では省略可）
2. `docker compose up -d db` で DB 起動。ヘルシになるまで待つ。
3. `npx prisma migrate dev --name init`（マイグレーション名は任意）。
4. `npx prisma generate`（CI・他端末でも `generate` が必要。生成物は `.gitignore` 対象の場合あり）。

## 参考: その他のフォローアップ（優先度低め）

- ドキュメントは Next.js 15 表記が多いが、実装は Next.js 16 系の可能性あり。必要なら `AGENTS.md` 等を同期。
- `.gitignore` が create-next-app 由来で簡素化されている場合、`docs/evidence/`・`e2e/`・`.claude/logs` 等の除外ルールをプロジェクト方針に合わせて復元する。
- `tmpapp/` に別アプリのコピーが残っていれば削除または除外（リポジトリ肥大・混入防止）。

## 参照ファイル

- `prisma/schema.prisma`
- `src/lib/db.ts`
- `src/lib/auth.ts`
- `src/env.ts`
- `docker-compose.yml`
- `.env.example`

---

ステータス: **未着手**（次回 Claude Code またはローカルで上記ブロッカー解消から開始する）。
