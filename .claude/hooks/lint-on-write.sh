#!/usr/bin/env bash
# PostToolUse hook: Run ESLint asynchronously after source file writes.
# NDA-safe: runs entirely local, no external communication.
# async: true in settings.json - Claude continues working while this runs.
#
# [TEMPLATE NOTE] Lint command and source dir are project-specific.
# Adjust SOURCE_DIR_PATTERN and the lint command when porting to another project.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Normalize Windows backslashes so pattern matching works on any OS
FILE_NORM=$(echo "$FILE_PATH" | tr '\\' '/')

# Only run for TypeScript/JavaScript source files
if ! echo "$FILE_NORM" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  exit 0
fi

# Only run for files inside the source directory
SOURCE_DIR_PATTERN='/src/'
if ! echo "$FILE_NORM" | grep -qE "$SOURCE_DIR_PATTERN"; then
  exit 0
fi

# Lint only the edited file to keep the async run fast
RESULT=$(cd "$PROJECT_DIR" && npx eslint "$FILE_PATH" 2>&1)
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
