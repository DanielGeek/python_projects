#!/usr/bin/env bash
# Sends a plain-text message to my Telegram through the Bot API (sendMessage).
# Reads TELEGRAM_BOT_TOKEN and TELEGRAM_USER_ID from the project .env at run time.
set -euo pipefail

if [ "$#" -eq 0 ] || [ -z "${*// /}" ]; then
  echo "Usage: telegram-send.sh <message>" >&2
  exit 1
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
ENV_FILE="$ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing .env at $ENV_FILE" >&2
  exit 1
fi

read_key() {
  grep -m1 "^$1=" "$ENV_FILE" | cut -d= -f2- | tr -d '\r"'"'" || true
}

TOKEN="$(read_key TELEGRAM_BOT_TOKEN)"
CHAT_ID="$(read_key TELEGRAM_USER_ID)"

if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ]; then
  echo "TELEGRAM_BOT_TOKEN or TELEGRAM_USER_ID is missing in .env" >&2
  exit 1
fi

MSG="${*:0:4096}"

RESPONSE="$(curl -sS -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${MSG}" 2>&1 | sed "s#${TOKEN}#<token>#g")"

if [ "$(printf '%s' "$RESPONSE" | jq -r '.ok' 2>/dev/null)" = "true" ]; then
  echo "Sent (message_id $(printf '%s' "$RESPONSE" | jq -r '.result.message_id'))"
else
  echo "Telegram error: $(printf '%s' "$RESPONSE" | jq -r '.description // .' 2>/dev/null || printf '%s' "$RESPONSE")" >&2
  exit 1
fi
