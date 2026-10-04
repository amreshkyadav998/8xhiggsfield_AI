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

## Issues found later in the build session (93c72ce7)

- **Entry numbering gap.** Prompt 2 pasted this spec, whose example log contains literal
  `[LOG_ENTRY ...]` lines. The hook counted every `[LOG_ENTRY` match in the file, so it numbered
  the reply to prompt 2 as `RESPONSE num=4`. The next prompt became `num=5`, and there is no
  `num=3`. No prompt or response is missing. The entries were left as written. Found during an
  audit at prompt 16, which pasted the spec again.
  - **Fix** in `.claude/hooks/capture.mjs`: only markers at the start of a line that carry this
    session's id count, and new numbers continue from the highest existing number. Tested on copies
    of the log (LF and CRLF) before it went live.
- **Author handle.** The hook's default was `amreshky998`; the GitHub handle is `amreshkyadav998`.
  The default is fixed, and the hook now writes the handle into the header's `author` field and
  `Session:` line. The entries are unchanged.
- **Model switch is visible.** Entries before the switch say `claude-sonnet-5-5`, and entries after
  it say `claude-opus-5-5`. The header `model:` is the session's first model.
- **Interrupted responses.** A few turns were cut off mid-response by a safety filter. Their RESPONSE
  entries hold whatever final text the Stop hook could read, unedited.
