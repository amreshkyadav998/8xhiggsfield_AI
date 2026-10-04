// 8x agent capture: logs each prompt (UserPromptSubmit) and each turn's final response (Stop)
// into .agent-logs/<date>_<time>_<session>.md. Append-only. Prompt + final response only.
import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2]; // "prompt" | "stop"
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const dir = path.join(root, ".agent-logs");
const AUTHOR = process.env.AGENT_LOG_AUTHOR || "amreshkyadav998"; // GitHub handle (repo owner)
const PROJECT = "higgsfield-rebuild";

let raw = "";
for await (const c of process.stdin) raw += c;
const input = JSON.parse(raw || "{}");
const sid = input.session_id || "unknown";
fs.mkdirSync(dir, { recursive: true });

const textOf = (content) =>
  typeof content === "string"
    ? content
    : (content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");

function modelFromTranscript() {
  try {
    const lines = fs.readFileSync(input.transcript_path, "utf8").trim().split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const o = JSON.parse(lines[i]);
      if (o.type === "assistant" && o.message?.model) return o.message.model;
    }
  } catch {}
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5"; // transcript is empty on a session's first prompt
}

function findFile() {
  return fs.readdirSync(dir).map((f) => path.join(dir, f)).find((f) => f.endsWith(`_${sid}.md`));
}

// Only real entries: markers at the start of a line with this session's id. A prompt that pastes the
// spec's example log (indented, other session id) must not be counted. (Before 2026-10-04 04:4x this
// matched anywhere, which skipped num=3 in session 93c72ce7; see CAPTURE-TEST.md.)
function entries(body) {
  const re = new RegExp(`^\\[LOG_ENTRY type=(PROMPT|RESPONSE) num=(\\d+) session=${sid.slice(0, 8)}\\]\\r?$`, "gm");
  return [...body.matchAll(re)].map((m) => [m[1], +m[2]]);
}
const lastPromptNum = (es) => Math.max(0, ...es.filter(([t]) => t === "PROMPT").map(([, n]) => n));

function updateHeader(file) {
  let s = fs.readFileSync(file, "utf8");
  const ts = [...s.matchAll(new RegExp(`^\\[LOG_ENTRY type=PROMPT num=\\d+ session=${sid.slice(0, 8)}\\]\\r?\\ntimestamp: (\\S+)`, "gm"))].map((m) => m[1]);
  const n = ts.length;
  s = s.replace(/^author: \S+/m, `author: ${AUTHOR}`)
       .replace(/^Session: `(\w+)` \| Project: `([^`]+)` \| Author: `[^`]+`/m, (_, a, b) => `Session: \`${a}\` | Project: \`${b}\` | Author: \`${AUTHOR}\``)
       .replace(/total_exchanges: \d+/, `total_exchanges: ${n}`)
       .replace(/last_prompt_time: \S+/, `last_prompt_time: ${ts[n - 1]}`);
  fs.writeFileSync(file, s);
}

function append(file, type, num, model, text) {
  const e = `\n[LOG_ENTRY type=${type} num=${num} session=${sid.slice(0, 8)}]\ntimestamp: ${new Date().toISOString()}\nmodel: ${model}\n\n${text}\n\n`;
  fs.appendFileSync(file, e);
}

if (mode === "prompt") {
  const model = modelFromTranscript();
  let file = findFile();
  const now = new Date();
  if (!file) {
    const stamp = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
    file = path.join(dir, `${stamp}_${sid}.md`);
    const iso = now.toISOString();
    fs.writeFileSync(
      file,
      `---\nsession_id: ${sid}\ndate: ${iso.slice(0, 10)}\nauthor: ${AUTHOR}\nmodel: ${model}\ntool: claude-code\nproject: ${PROJECT}\ntotal_exchanges: 0\nfirst_prompt_time: ${iso}\nlast_prompt_time: ${iso}\n---\n\n# Session Log - ${iso.slice(0, 10)}\n\nSession: \`${sid.slice(0, 8)}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\`\n\n---\n`
    );
  }
  const num = lastPromptNum(entries(fs.readFileSync(file, "utf8"))) + 1;
  append(file, "PROMPT", num, model, input.prompt ?? "");
  updateHeader(file);
} else if (mode === "stop") {
  const file = findFile();
  if (!file) process.exit(0);
  const es = entries(fs.readFileSync(file, "utf8"));
  const num = lastPromptNum(es);
  if (es.some(([t, n]) => t === "RESPONSE" && n === num)) process.exit(0);
  // Final response = assistant text after the last real user prompt in the transcript.
  const lines = fs.readFileSync(input.transcript_path, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  let start = 0;
  lines.forEach((o, i) => {
    if (o.type === "user" && !o.isMeta && !o.isSidechain) {
      const c = o.message?.content;
      const isToolResult = Array.isArray(c) && c.some((b) => b.type === "tool_result");
      if (!isToolResult && textOf(c).trim()) start = i;
    }
  });
  const asst = lines.slice(start + 1).filter((o) => o.type === "assistant" && !o.isSidechain);
  const texts = asst.map((o) => textOf(o.message?.content)).filter((t) => t.trim());
  const final = input.last_assistant_message || texts[texts.length - 1] || "";
  append(file, "RESPONSE", num, asst.length ? asst[asst.length - 1].message?.model || modelFromTranscript() : modelFromTranscript(), final);
}
