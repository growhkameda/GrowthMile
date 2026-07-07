// Prisma 7 設定。datasource.url は schema.prisma ではなくここで管理する（project-stack.md 参照）。
// 素の `import "dotenv/config"` は .env しか読まないため、Next.js と同じ優先順
// （.env.local を優先し、次に .env）で明示的に読み込む。
import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"

loadEnv({ path: [".env.local", ".env"], quiet: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
