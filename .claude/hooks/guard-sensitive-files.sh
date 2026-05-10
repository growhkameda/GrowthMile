#!/usr/bin/env bash
# PreToolUse hook: Protect sensitive files from Write/Edit operations by Claude.
# NDA-safe: runs entirely local, no external communication.
# Prevents accidental overwrite of .env, keys, certificates, and secret files.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

FILE_NAME=$(basename "$FILE_PATH")
FILE_LOWER=$(echo "$FILE_PATH" | tr '[:upper:]' '[:lower:]')

# Block .env and .env.* files
if echo "$FILE_NAME" | grep -qE '^\.env$|^\.env\.'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ".env files are protected from AI modification. Edit them manually."
    }
  }'
  exit 0
fi

# Block certificate and private key files
if echo "$FILE_LOWER" | grep -qE '\.(pem|key|p12|jks|keystore|crt|cer|pfx)$'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Certificate/key files are protected from AI modification."
    }
  }'
  exit 0
fi

# Block files with sensitive names (secrets, credentials, passwords, tokens)
FILE_BASE=$(echo "$FILE_NAME" | tr '[:upper:]' '[:lower:]')
if echo "$FILE_BASE" | grep -qE '(secret|credential|password|passwd|\.token)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Files containing secrets or credentials are protected from AI modification."
    }
  }'
  exit 0
fi

exit 0