import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

/**
 * 環境変数の実行時バリデーション（@t3-oss/env-nextjs + Zod）。
 *
 * ## NextAuth (Auth.js) v4 → v5 互換性の方針
 * - v5 では `AUTH_SECRET` が公式の名称。`AUTH_URL` は同様。
 * - v5 ランタイムは `AUTH_SECRET` が無い場合に `NEXTAUTH_SECRET` を自動でフォールバックするが、
 *   本プロジェクトは Zod で実行時に必ず検証する方針なので、`runtimeEnv` 側でも明示的にフォールバック合成する。
 * - 旧 `.env`（`NEXTAUTH_SECRET=...`）を残したままでも v5 ランタイムが動くよう両対応にしてある。
 * - `AUTH_URL` は v5 では多くのデプロイ先（Vercel など）で不要なので任意項目とする。
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    AUTH_URL: z.string().url().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // v5 名 → v4 名（NEXTAUTH_SECRET）の順でフォールバック
    AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
})
