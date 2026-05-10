---
name: Env var migration NEXTAUTH→AUTH
description: NextAuth v4→v5 移行に伴い AUTH_SECRET/AUTH_URL が公式名。src/env.ts は両対応済みだが CI・docs に旧名が残る傾向あり
type: project
---

`src/env.ts` は v5 への移行で `AUTH_SECRET` / `AUTH_URL` をスキーマ正としつつ、`runtimeEnv` で `process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET` のフォールバックを入れて両対応にしてある。

**Why:** v5 ランタイム自体も NEXTAUTH_SECRET を読むフォールバックを持つが、ベータ版（beta.31）に頼り続けるべきではない。CI Secret 名（`CI_NEXTAUTH_SECRET`）と GitHub Actions の env キー（`NEXTAUTH_SECRET` / `NEXTAUTH_URL`）も移行範囲。

**How to apply:** 認証/環境変数まわりの差分を見たら必ず以下を grep して同期確認：

- `.github/workflows/ci.yml`
- `docs/ai/pending-setup.md`
- `docs/agentic/next-task-prisma-nextauth-setup.md`
- `docs/architecture/spec-infrastructure.md`
- `README.md` / `.env.example`
旧名が残っていれば「設計書との整合性」観点で指摘する。
