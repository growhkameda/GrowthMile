import { handlers } from "@/lib/auth"

/**
 * NextAuth (Auth.js v5) の API ルートハンドラ。
 *
 * App Router の動的 catch-all ルート `/api/auth/[...nextauth]` で v5 の `handlers` を公開する。
 * `handlers` は `{ GET, POST }` 形式で提供されるため、そのまま分割代入して export する。
 * v4 の `NextAuth(authOptions)` を default export する書き方は v5 では非推奨のため使用しない。
 */
export const { GET, POST } = handlers
