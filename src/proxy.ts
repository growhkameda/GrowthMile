import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

/**
 * Next.js Proxy（Auth.js v5）。
 *
 * PrismaAdapter を含む完全設定（`@/lib/auth`）ではなく、Edge Runtime 互換の軽量設定（`@/auth.config`）を使用する。
 * Prisma client が node:path / node:url を使用するため、proxy から直接 import するとビルド警告が出る。
 *
 * matcher は **意図的に `/dashboard/:path*` に限定**している。
 * 理由: ログインページ（`/login`）が未実装のため、全ルートを保護対象にすると
 * 未認証 → ログインへのリダイレクト先が無く認証ループに陥る。
 * 将来 `/login` 実装後に matcher を拡張する想定。
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/proxy Next.js: Proxy}
 * @see {@link https://authjs.dev/getting-started/session-management/protecting?framework=next-js#nextjs-middleware Auth.js: Protecting routes}
 */
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/dashboard/:path*"],
}
