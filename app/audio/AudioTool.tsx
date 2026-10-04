"use client";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { MODELS, VOICES, price, ttsUnits } from "@/lib/catalog";
import { byTopic } from "@/lib/media";
import { useApp, type Job } from "@/lib/store";
import Media from "@/components/Media";
import ToolShell, { useRightTab } from "@/components/tool/ToolShell";
import DropZone, { type Upload } from "@/components/tool/DropZone";
import PriceButton from "@/components/tool/PriceButton";
import VoicePicker, { voiceAvatar } from "@/components/tool/VoicePicker";

type Tab = "tts" | "change" | "music";
const TABS = [
  { id: "tts", label: "Text to Speech" },
  { id: "change", label: "Voice Change" },
  { id: "music", label: "Music" },
];
const MOODS = ["Chill", "Epic", "Upbeat", "Dark", "Romantic", "Lo-fi"];
const MAX = 2000;
const box = "w-full resize-none rounded-2xl border border-line bg-black/20 p-4 text-[15px] outline-none placeholder:text-mute focus:border-white/30";
const label = "mb-1.5 flex items-center justify-between px-1 text-sm text-mute";

const HOW: Record<Tab, [string, string]> = {
  tts: ["Turn text into speech", "Lifelike speech from any script, ready for your projects"],
  change: ["Change any voice", "Record once, then hear it in a different voice"],
  music: ["Score your cut", "Original background music from a mood and a few words"],
};

function How({ tab }: { tab: Tab }) {
  return (
    <div className="px-1 py-6 text-center md:px-6 md:py-10">
      <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-6xl">{HOW[tab][0]}</h2>
      <p className="mt-3 text-mute md:text-lg">{HOW[tab][1]}</p>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-line bg-panel">
          <div className="p-6">
            <h3 className="text-2xl font-semibold">Pick a voice</h3>
            <p className="mt-1 text-mute">Six preset voices. Preview each one before you spend a credit.</p>
          </div>
          <div className="relative h-56">
            <Media item={byTopic("sunset", 2, "image")} ratio="16:9" width={700} className="opacity-50" />
            {VOICES.slice(0, 3).map((v, i) => (
              <div key={v.id} className="absolute flex items-center gap-2 rounded-full bg-black/70 py-1.5 pl-1.5 pr-4 backdrop-blur" style={{ left: `${8 + i * 22}%`, top: `${12 + i * 26}%` }}>
                <span className="h-9 w-9 overflow-hidden rounded-full">
                  <Media item={voiceAvatar(v)} ratio="1:1" width={80} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{v.name}</span>
                  <span className="block text-[10px] text-mute">{v.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-panel p-6">
          <h3 className="text-2xl font-semibold">Write, describe and generate</h3>
          <p className="mt-1 text-mute">Type your script, set the pace, and play the result straight from History.</p>
          <div className="mt-5 rounded-2xl border border-line bg-black/40 p-4">
            <div className="flex gap-4 border-b border-line pb-2 text-sm">
              {TABS.map((t) => (
                <span key={t.id} className={t.id === tab ? "font-semibold text-white" : "text-mute"}>
                  {t.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-white/80">
              <span className="text-mute">Script: </span>“Every frame tells a story. Let&apos;s tell yours.”
            </p>
            <div className="mt-4 flex items-end gap-1">
              {Array.from({ length: 32 }, (_, i) => (
                <span key={i} className="w-1.5 rounded-full bg-accent" style={{ height: 6 + Math.abs(Math.sin(i * 0.7)) * 34 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudioTool() {
  const params = useSearchParams();
  const { generate } = useApp();
  const right = useRightTab("audio");
  const [tab, setTab] = useState<Tab>(params.get("model") === "score" ? "music" : "tts");
  const [error, setError] = useState("");

  const [media, setMedia] = useState<Upload[]>([]);
  const [script, setScript] = useState(params.get("prompt") ?? "");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [speed, setSpeed] = useState(1);
  const [rec, setRec] = useState<Upload[]>([]);
  const [target, setTarget] = useState(VOICES[2].id);
  const [mood, setMood] = useState(MOODS[0]);
  const [musicDesc, setMusicDesc] = useState("");
  const scriptRef = useRef<HTMLTextAreaElement>(null);

  const voiceModel = MODELS.find((m) => m.id === "voice")!;
  const scoreModel = MODELS.find((m) => m.id === "score")!;
  const units = ttsUnits(script.length);
  const cost = tab === "tts" ? price(voiceModel, { count: units }) : tab === "change" ? price(voiceModel) : price(scoreModel);

  const insertMention = (name: string) => {
    const tag = `@${name.replace(/\.\w+$/, "").replace(/\s+/g, "_")} `;
    setScript((s) => `${s}${s && !s.endsWith(" ") ? " " : ""}${tag}`);
    scriptRef.current?.focus();
  };

  const run = (job: Parameters<typeof generate>[0]) => {
    const r = generate(job);
    setError(r.ok ? "" : (r.error ?? ""));
    if (r.ok) {
      right.set("history");
      if (window.innerWidth < 1024) document.getElementById("tool-results")?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const base = { kind: "audio" as const, ratio: "16:9" as const, seconds: 1, count: 1 };

  const submit = () => {
    if (tab === "tts") {
      if (!script.trim()) return setError("Write the script the voice should read");
      run({ ...base, modelId: "voice", prompt: script.trim(), voice, rate: speed, units, refs: media.length || undefined, tool: "Text to Speech" });
    } else if (tab === "change") {
      if (!rec[0]) return setError("Upload a recording to change");
      const v = VOICES.find((x) => x.id === target)!;
      run({ ...base, modelId: "voice", prompt: `${rec[0].name} in ${v.name}'s voice`, voice: target, source: rec[0].url, tool: "Voice Change" });
    } else {
      run({ ...base, modelId: "score", prompt: `${mood} music${musicDesc.trim() ? `: ${musicDesc.trim()}` : ""}`, tool: `Music · ${mood}` });
    }
  };

  const reuse = (j: Job) => {
    if (j.modelId === "score") {
      setTab("music");
      return;
    }
    setTab("tts");
    if (!j.source) setScript(j.prompt);
    if (j.voice) setVoice(j.voice);
    if (j.rate) setSpeed(j.rate);
  };

  const body =
    tab === "tts" ? (
      <>
        <DropZone accept={["audio", "image"]} max={3} files={media} onChange={setMedia} title="Upload media" sub="Up to 3 voices, audio clips or an image" optional maxMB={50} />
        <div className="rounded-2xl border border-line bg-black/20 p-3">
          <div className={label}>
            Script
            <span className={script.length > MAX * 0.9 ? "text-amber-400" : ""}>
              {script.length}/{MAX}
            </span>
          </div>
          <textarea
            ref={scriptRef}
            value={script}
            onChange={(e) => setScript(e.target.value.slice(0, MAX))}
            rows={6}
            placeholder={"Write exactly what the voice will read out loud.\nType @ to reference attachments."}
            className="w-full resize-none bg-transparent px-1 text-[15px] outline-none placeholder:text-mute"
          />
          {media.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {media.map((m) => (
                <button key={m.url} onClick={() => insertMention(m.name)} className="rounded-full bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20">
                  @ {m.name}
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 px-1 text-xs text-mute">
            Billed per 400 characters · {units} unit{units > 1 ? "s" : ""}
          </p>
        </div>
        <VoicePicker value={voice} onChange={setVoice} />
        <div className="rounded-2xl border border-line bg-black/20 p-3">
          <div className={label}>
            Speed <span className="text-white">{speed.toFixed(2)}×</span>
          </div>
          <input type="range" min={0.75} max={1.25} step={0.05} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed" className="w-full accent-[#d1fe17]" />
        </div>
      </>
    ) : tab === "change" ? (
      <>
        <DropZone accept={["audio"]} max={1} files={rec} onChange={setRec} title="Upload a recording" sub="MP3, WAV or M4A · up to 50 MB" maxMB={50} />
        <VoicePicker value={target} onChange={setTarget} />
        <p className="px-1 text-xs text-mute">The result plays your recording re-pitched toward the chosen voice. Uploads stay in your browser until you reload.</p>
      </>
    ) : (
      <>
        <div>
          <div className={label}>Mood</div>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map((m, i) => (
              <button key={m} onClick={() => setMood(m)} className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${mood === m ? "border-accent" : "border-transparent"}`}>
                <Media item={byTopic(["sunset", "mountain", "dance", "neon", "flowers", "coffee"][i], i, "image")} ratio="4:5" width={200} />
                <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-bold">{m}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className={label}>Describe it (optional)</div>
          <textarea value={musicDesc} onChange={(e) => setMusicDesc(e.target.value)} rows={3} maxLength={300} placeholder="Warm synth pads for a travel montage" className={box} />
        </div>
        <p className="px-1 text-xs text-mute">10-second loop, composed in your browser. Play it from History.</p>
      </>
    );

  const reason = tab === "tts" && !script.trim() ? "Write a script to continue" : tab === "change" && !rec[0] ? "Upload a recording to continue" : undefined;

  return (
    <ToolShell
      kind="audio"
      tabs={TABS}
      tab={tab}
      onTab={(t) => (setTab(t as Tab), setError(""))}
      right={right.value}
      onRight={right.set}
      onReuse={reuse}
      how={<How tab={tab} />}
      body={body}
      footer={
        <>
          {error && (
            <p role="alert" className="mb-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}
          <PriceButton list={cost.list} charge={cost.charge} disabled={!!reason} reason={reason} onClick={submit} next="/audio" />
        </>
      }
    />
  );
}
