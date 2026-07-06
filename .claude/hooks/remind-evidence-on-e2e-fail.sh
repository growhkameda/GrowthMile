#!/usr/bin/env bash
# PostToolUse hook: Detect Playwright E2E failures and remind Claude to save an Evidence Bundle.
# NDA-safe: reads only local tool output data, no external communication.
# Evidence is required ONLY for E2E/ST failures (see rules/core-ai-workflow.md).
# Local lint/build/unit-test failures are fixed in place and do NOT trigger this hook.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only process Playwright E2E commands
if [ -z "$COMMAND" ]; then exit 0; fi
if ! echo "$COMMAND" | grep -qiE 'playwright\s+test|npm\s+run\s+e2e'; then
  exit 0
fi

# Extract tool output (tool_response may be string or object)
TOOL_OUTPUT=$(echo "$INPUT" | jq -r '.tool_response // "" | if type == "string" then . else ((.stdout // "") + " " + (.stderr // "")) end')

# Check for failure signals in the output
if ! echo "$TOOL_OUTPUT" | grep -qiE '([0-9]+ failed|[0-9]+ flaky|Error:|Timed out)'; then
  exit 0
fi

FILE_NAME="$(date +%Y%m%d-%H%M)-e2e-fail.md"
SAVE_PATH="docs/evidence/build-test/${FILE_NAME}"

MESSAGE="[HOOK] E2E (Playwright) failure detected.

Before proceeding to the next action, you MUST:
1. Invoke the rework-report skill (.claude/skills/rework-report/SKILL.md)
2. Save the Evidence Bundle to ${SAVE_PATH}
3. Report to the user after saving
Do NOT proceed to the next task without saving the evidence file."

jq -n --arg msg "$MESSAGE" '{"systemMessage": $msg}'
