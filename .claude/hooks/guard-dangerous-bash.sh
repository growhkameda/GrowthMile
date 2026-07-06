#!/usr/bin/env bash
# PreToolUse hook: Block dangerous bash commands before Claude executes them.
# NDA-safe: runs entirely local, no external communication.
# Complements the deny list in permissions by adding logic-based blocking.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Block broad rm -rf targeting root, wildcards, or parent directories
if echo "$COMMAND" | grep -qE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(/[^/]|[*]|\./\*|\.\.\/)' || \
   echo "$COMMAND" | grep -qE 'rm\s+-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*\s+(/[^/]|[*]|\./\*|\.\.\/)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Broad destructive rm -rf is blocked by the security hook. Use specific file paths."
    }
  }'
  exit 0
fi

# Block git push --force / -f (force push to prevent history rewrite)
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(--force|-f)\b'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "git push --force is blocked to prevent history rewrite on shared branches."
    }
  }'
  exit 0
fi

# Block cat/echo/type of .env files to prevent secrets leaking into transcripts
if echo "$COMMAND" | grep -qE '(^|\s)(cat|echo|type)\s+[^ ]*\.env(\s|$)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Printing .env content via cat/echo is blocked to prevent secrets leaking into logs or transcripts."
    }
  }'
  exit 0
fi

# Block chmod 777 (overly permissive file permissions)
if echo "$COMMAND" | grep -qE 'chmod\s+777'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "chmod 777 is blocked. Use the minimum required permissions instead."
    }
  }'
  exit 0
fi

exit 0