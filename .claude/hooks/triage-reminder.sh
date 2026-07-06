#!/usr/bin/env bash
# UserPromptSubmit hook: Inject a one-line triage reminder before Claude processes each prompt.
# For UserPromptSubmit, plain stdout on exit 0 is added as context Claude can see.
# Kept intentionally tiny (fires every turn) - the full discipline lives in rules/core-cognition.md.

echo "[HOOK] Triage first (core-cognition.md): declare LIGHT/STANDARD/COMPLEX. COMPLEX -> deep-plan skill + plan-reviewer before implementation. STANDARD+ -> self-review before completion report."
exit 0
