---
description: Send a message to my Telegram
argument-hint: [message]
allowed-tools: Bash(.claude/scripts/telegram-send.sh:*)
---

Send a Telegram message with the local script.

- If `$ARGUMENTS` is not empty, send it exactly as written.
- If it is empty, write a short summary (5 lines at most) of what was done in this session and send that.

Run `.claude/scripts/telegram-send.sh "<message>"` and report the result in one line. Never read or print values from `.env`.
