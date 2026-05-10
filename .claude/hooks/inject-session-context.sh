#!/usr/bin/env bash
# SessionStart hook: Inject git status and project progress context into Claude's session.
# NDA-safe: reads only local files, no external communication.
# Fires only on new session startup (matcher: "startup").

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Git branch name
GIT_BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")

# Git status (up to 20 lines)
GIT_STATUS=$(git -C "$PROJECT_DIR" status --short 2>/dev/null | head -20)

# Build context string
CONTEXT="=== Auto-injected Session Context ==="
CONTEXT="$CONTEXT
Git Branch: $GIT_BRANCH"

if [ -n "$GIT_STATUS" ]; then
  CONTEXT="$CONTEXT
Modified files (git status --short):
$GIT_STATUS"
else
  CONTEXT="$CONTEXT
Working tree: clean"
fi

# Append progress notes from PROGRESS.md if it exists, otherwise fall back to README.md
PROGRESS_FILE="$PROJECT_DIR/docs/agentic/PROGRESS.md"
FALLBACK_FILE="$PROJECT_DIR/docs/agentic/README.md"

if [ -f "$PROGRESS_FILE" ]; then
  CONTEXT="$CONTEXT

=== Recent Progress (last 20 lines of docs/agentic/PROGRESS.md) ===
$(tail -20 "$PROGRESS_FILE")"
elif [ -f "$FALLBACK_FILE" ]; then
  CONTEXT="$CONTEXT

=== Project Status (last 20 lines of docs/agentic/README.md) ===
$(tail -20 "$FALLBACK_FILE")"
fi

CONTEXT="$CONTEXT
==="

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'

exit 0