---
name: Auth.js v5 edge-split pattern
description: GrowthMile が next-auth v5 を採用しているため、middleware を Edge Runtime 互換にするための auth.config.ts 分離パターンを既定とする
type: project
---

GrowthMile では `next-auth ^5.0.0-beta.31` + `@auth/prisma-adapter` + `session.strategy: "jwt"` を採用している。`src/middleware.ts` が `@/lib/auth` 経由で Prisma Client（`node:path` / `node:url` を使う）を import すると Next.js が Edge Runtime 警告を出す。

**Why:** Adapter が中で Node.js 専用モジュールを参照するため、middleware (Edge 強制) のバンドルに混ざる。現状は JWT 戦略 + authorize=null で発火していないが、OAuth provider 追加や Adapter フォールバック分岐で容易にランタイム例外になる。

**How to apply:** 認証関連のレビュー時、次の構成になっているか確認する：

- `src/auth.config.ts`: Adapter を含まない `NextAuthConfig`（providers, callbacks, session 戦略のみ）。`satisfies NextAuthConfig` で型を担保する。
- `src/lib/auth.ts`: `...authConfig` を展開し `adapter: PrismaAdapter(db)` と Credentials provider を足した `NextAuth(...)` を Node 用に export。`providers` を上書きする際は authConfig の providers が空であることを確認（providers の二重定義による意図しない動作に注意）。
- `src/middleware.ts`: `NextAuth(authConfig).auth` を default export（Next.js middleware の規約）。`@/lib/auth` 由来の `auth` を直接 export してはいけない。
- 公式: <https://authjs.dev/guides/edge-compatibility>
