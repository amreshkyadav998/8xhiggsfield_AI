# Capture Test

- **Tool:** Claude Code (CLI)
- **Model:** claude-sonnet-5-5 (single model; plans and executes)
- **Mechanism:** Claude Code hooks, config in `.claude/settings.json`:
  - `UserPromptSubmit` -> `node .claude/hooks/capture.mjs prompt` (logs the prompt)
  - `Stop` -> `node .claude/hooks/capture.mjs stop` (logs the turn's final response, read from the transcript)
- **Log files the canaries landed in:**
  - `.agent-logs/2026-10-04_02-25-58_4d64981c-33f6-41af-b060-d16314f6c210.md` (session 1)
  - `.agent-logs/2026-10-04_02-26-06_842ee009-3c0f-4534-9186-4a54b1967146.md` (session 2, a separate `claude -p` process)

## Canary 1 (raw)

```
[LOG_ENTRY type=PROMPT num=1 session=4d64981c]
timestamp: 2026-10-04T02:25:58.399Z
model: unknown

CAPTURE TEST — 8x assignment, Amresh. Reply with one short sentence.


[LOG_ENTRY type=RESPONSE num=1 session=4d64981c]
timestamp: 2026-10-04T02:26:00.835Z
model: claude-sonnet-5-5

Capture test received, Amresh — the 8x assignment is acknowledged.

```

## Canary 2 (raw)

```
[LOG_ENTRY type=PROMPT num=1 session=842ee009]
timestamp: 2026-10-04T02:26:06.751Z
model: unknown

CAPTURE TEST 2 — 8x assignment, Amresh. Reply with one short sentence.


[LOG_ENTRY type=RESPONSE num=1 session=842ee009]
timestamp: 2026-10-04T02:26:09.176Z
model: claude-sonnet-5-5

Capture test 2 received, Amresh: the 8x assignment is noted and I'm ready for the next step.

```

## Notes / what did not work first

- Both canaries were sent with `claude -p` from inside the repo (two separate sessions).
- The prompt entries show `model: unknown`: the transcript is empty when a session's first
  prompt fires, so the hook could not read the model. Entries are append-only and were not
  edited. The hook now falls back to `claude-sonnet-5-5`; the RESPONSE entries carry the real model.
- Before the repo existed, the planning conversation took place in a Claude Code session started
  outside the repo, so it was not captured. It covered only reading the brief.
