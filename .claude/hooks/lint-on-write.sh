#!/usr/bin/env bash
# PostToolUse hook: Run frontend lint asynchronously after TypeScript/JavaScript file writes.
# NDA-safe: runs only local docker-compose commands, no external communication.
# async: true in settings.json 窶・Claude continues working while this runs in background.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Only run for TypeScript/JavaScript source files
if ! echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  exit 0
fi

# Only run for files inside the frontend directory
if ! echo "$FILE_PATH" | grep -qE '/frontend/'; then
  exit 0
fi

# Run frontend lint via docker-compose and capture output (last 40 lines to stay concise)
RESULT=$(docker-compose -f "$PROJECT_DIR/docker-compose.yml" exec -T frontend npm run lint 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  jq -n --arg file "$(basename "$FILE_PATH")" '{
    systemMessage: ("Lint passed after editing " + $file + ".")
  }'
else
  RESULT_TRIMMED=$(echo "$RESULT" | tail -40)
  jq -n --arg file "$(basename "$FILE_PATH")" --arg result "$RESULT_TRIMMED" '{
    systemMessage: ("Lint FAILED after editing " + $file + ". Please fix the following errors before proceeding:\n" + $result)
  }'
fi

exit 0