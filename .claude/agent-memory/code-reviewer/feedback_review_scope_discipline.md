---
name: Review scope discipline (out-of-scope drift acknowledgement)
description: ユーザーがレビュー対象を明示し既知別タスクを除外した場合、その境界を尊重しつつ周辺の旧名残りは Notes で軽く触れる
type: feedback
---

ユーザーから「R-004（DB マイグレーション未実行）は別タスク」「README 等は今回スコープ外」と明示された場合、判定はあくまでスコープ内の差分のみで決める。スコープ外の旧名残り（`README.md` の NEXTAUTH_SECRET、`.claude/rules/project-tech-stack.md`、`docs/onboarding/*.html`、`spec-infrastructure.md` の `CI_NEXTAUTH_SECRET` Secret 名など）は **判定材料にしない** が、Notes セクションで「次タスクで掃除推奨」と一言だけ残す。

**Why:** スコープを越えて FAIL を付けると、修正サイクルが永遠に終わらない。一方で完全沈黙すると後続タスクで同じ箇所を再発見してしまう。

**How to apply:** PASS_WITH_NOTES の Notes セクションに「out-of-scope だがフォローアップ候補」として列挙する。判定スコアには含めない。
