import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { authConfig } from "@/auth.config"

/**
 * NextAuth (Auth.js v5) のコア設定。
 *
 * - `authConfig`（Edge Runtime 互換ベース設定）を展開し、PrismaAdapter と Credentials プロバイダーを追加する。
 * - `session.strategy = "jwt"` を採用。Credentials プロバイダーは DB セッション戦略と相性が悪く、
 *   JWT 戦略の方が Edge Runtime（middleware）でも検証コストが低いため。
 * - `Credentials` プロバイダーはスケルトン状態。`authorize` は `null` を返すので現時点ではログインは通らないが、
 *   ルートハンドラ（`/api/auth/[...nextauth]`）と middleware の配線確認のために最低 1 つ provider を置いておく。
 * - 実際のメール+パスワード検証（bcrypt + DB 照合）は `feat: ログイン機能` の別タスクで `authorize` 内に実装する。
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // TODO: bcrypt によるパスワード検証と DB 照合を実装する（別タスク）
      authorize: async () => {
        return null
      },
    }),
  ],
})
