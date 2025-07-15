#!/bin/sh
set -e
# Simple helper to patch .env.local with correct Supabase URL placeholder
FILE="resumebuilder-ai/.env.local"
if [ ! -f "$FILE" ]; then
  echo "No $FILE found" >&2
  exit 1
fi
# Replace dashboard URL with project API URL if needed
sed -i 's#https://supabase.com/dashboard/project/[^ ]*#https://YOURPROJECT.supabase.co#' "$FILE"
# Ensure required keys exist
grep -q '^SUPABASE_SERVICE_ROLE_KEY=' "$FILE" || echo 'SUPABASE_SERVICE_ROLE_KEY=' >> "$FILE"
grep -q '^OPENAI_API_KEY=' "$FILE" || echo 'OPENAI_API_KEY=' >> "$FILE"
