#!/usr/bin/env bash
# PostToolUse hook: Detect build/test/lint failures and remind Claude to save Evidence Bundle.
# NDA-safe: reads only local tool output data, no external communication.
# Fires after any Bash tool use, exits silently if no failure is detected.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only process test/build/lint commands
if [ -z "$COMMAND" ]; then exit 0; fi
if ! echo "$COMMAND" | grep -qiE '(npm\s+run\s+(build|lint|test|format:check)|npx\s+tsc|markdownlint|playwright\s+test)'; then
  exit 0
fi

# Extract tool output (tool_response may be string or object)
TOOL_OUTPUT=$(echo "$INPUT" | jq -r '.tool_response // "" | if type == "string" then . else ((.stdout // "") + " " + (.stderr // "")) end')

# Check for failure signals in the output
if ! echo "$TOOL_OUTPUT" | grep -qiE '(BUILD FAILED|FAILED|error TS[0-9]+|ERR!|markdownlint.*error|[0-9]+ error|Tests:\s+[0-9]+ failed|Test Suites:\s+[0-9]+ failed)'; then
  exit 0
fi

# Determine failure type
TEMPLATE_SUFFIX="build-fail"
if echo "$COMMAND" | grep -qiE 'npm\s+run\s+test|playwright\s+test'; then
  TEMPLATE_SUFFIX="test-fail"
elif echo "$COMMAND" | grep -qiE 'npm\s+run\s+(lint|format:check)|markdownlint'; then
  TEMPLATE_SUFFIX="lint-fail"
fi

FILE_NAME="$(date +%Y%m%d-%H%M)-${TEMPLATE_SUFFIX}.md"
SAVE_PATH="docs/evidence/build-test/${FILE_NAME}"

MESSAGE="[HOOK] Build/test failure detected.

Before proceeding to the next action, you MUST:
1. Read .claude/workflows/build-fail-report.md and use the relevant template
2. Save the Evidence Bundle to ${SAVE_PATH}
3. Report to the user after saving
Do NOT proceed to the next task without saving the evidence file."

jq -n --arg msg "$MESSAGE" '{"systemMessage": $msg}'