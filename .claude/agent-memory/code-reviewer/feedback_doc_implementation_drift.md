---
name: Doc-implementation drift check
description: GrowthMile では src/env.ts や schema 変更時にドキュメントの同期更新を必ずレビュー対象に含める
type: feedback
---

`src/env.ts` の Zod スキーマ変更、`prisma/schema.prisma` のモデル追加、認証フローの変更が入った PR では、CI 設定 (`.github/workflows/ci.yml`) と仕様書 (`docs/agentic/`, `docs/architecture/`, `docs/ai/pending-setup.md`) を必ず突き合わせる。

**Why:** AGENTS.md の「4. 設計書との整合性」観点と、CI が緑のまま実環境（Vercel 等）で env 不整合で落ちるリスクを防ぐため。直近の v4→v5 移行レビューで、コードは v5 化したが CI と docs/agentic 側に旧変数名が残るドリフトを検出した。

**How to apply:** 認証・環境変数・DB スキーマに触る差分を見たら、grep で旧名・旧モデル名を全リポジトリ検索し、ヒットしたファイルを Major 指摘として明示すること。「コードはOK」で終わらせない。
