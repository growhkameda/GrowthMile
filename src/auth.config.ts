import type { NextAuthConfig } from "next-auth"

/**
 * Auth.js v5 の Edge Runtime 互換ベース設定。
 *
 * PrismaAdapter と Credentials プロバイダーは Node.js API（node:path, node:url 等）に依存するため、
 * このファイルには含めない。proxy からここを import しても Edge Runtime で安全に動作する。
 * 完全な設定（adapter + providers）は `src/lib/auth.ts` で組み立てる。
 */
export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
} satisfies NextAuthConfig
