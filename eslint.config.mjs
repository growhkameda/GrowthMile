import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scaffolding temp directory
    "tmpapp/**",
    // V0 design mock (reference only, not part of main app)
    "employee-appreciation-app/**",
    // Prisma generated client
    "src/generated/**",
    // Claude Code skill assets (standalone Node scripts, not app code)
    ".claude/**",
  ]),
])

export default eslintConfig
