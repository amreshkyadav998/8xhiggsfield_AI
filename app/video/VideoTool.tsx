"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EDIT_LOOKS, EFFECTS, MODELS, MOTIONS, RATIOS, VIDEO_PRESETS, VIDEO_RES, fmt, price, type Ratio, type Res } from "@/lib/catalog";
import { STYLE_FILTERS, byTopic } from "@/lib/media";
import { jobStatus, useApp, type Job } from "@/lib/store";
import Media from "@/components/Media";
import Dropdown, { chipCls, rowCls } from "@/components/studio/Dropdown";
import ToolShell, { useRightTab } from "@/components/tool/ToolShell";
import { jobMedia } from "@/components/JobCard";
import DropZone, { type Upload } from "@/components/tool/DropZone";
import PriceButton from "@/components/tool/PriceButton";
import PresetPicker from "@/components/tool/PresetPicker";

type Tab = "create" | "edit" | "motion";
const TABS = [
  { id: "create", label: "Create Video" },
  { id: "edit", label: "Edit Video" },
  { id: "motion", label: "Motion Control" },
];
const box = "w-full resize-none rounded-2xl border border-line bg-black/20 p-4 text-[15px] outline-none placeholder:text-mute focus:border-white/30";
const label = "mb-1.5 block px-1 text-sm text-mute";

function How() {
  const steps: [string, string, React.ReactNode][] = [
    [
      "1",
      "Upload an image or write a prompt",
      <div key="a" className="grid h-full place-items-center rounded-xl border border-dashed border-white/20 text-center text-sm text-mute">
        <div>
          <div className="text-2xl">▣</div>
          <div className="mt-1 font-bold uppercase text-white">Upload image</div>
          or paste from clipboard
        </div>
      </div>,
    ],
    [
      "2",
      "Pick a preset for camera, framing or VFX",
      <div key="b" className="grid h-full grid-cols-3 gap-1.5">
        {VIDEO_PRESETS.slice(1, 4).map((p, i) => (
          <div key={p.id} className={`relative overflow-hidden rounded-lg ${i === 1 ? "ring-2 ring-accent" : ""}`}>
            <Media item={byTopic(p.topic, p.i, "video")} />
            <span className="absolute bottom-1 left-1 text-[9px] font-bold uppercase">{p.name}</span>
          </div>
        ))}
      </div>,
    ],
    [
      "3",
      "Generate and get your clip",
      <div key="c" className="h-full overflow-hidden rounded-xl border-4 border-white">
        <Media item={byTopic("neon", 1, "video")} />
      </div>,
    ],
  ];
  return (
    <div className="px-1 py-6 md:px-6 md:py-10">
      <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-6xl">Make videos in one click</h2>
      <p className="mt-3 max-w-2xl text-mute md:text-lg">{VIDEO_PRESETS.length - 1} presets for camera moves, framing and VFX, or the General preset for full manual control.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map(([n, t, art]) => (
          <div key={n} className="rounded-2xl border border-line bg-panel p-3">
            <div className="h-44">{art}</div>
            <div className="mt-3 flex items-center gap-2 px-1 pb-1">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-bold text-black">{n}</span>
              <span className="text-sm font-medium">{t}</span>
            </div>
          </div>
        ))}
      </div>
      <Link href="/#vfx" className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-gradient-to-r from-panel to-[#1b1f0a] p-5 hover:border-mute">
        <div>
          <div className="text-lg font-bold">Don&apos;t know where to start?</div>
          <div className="text-sm text-mute">Browse ready-made shots on Explore and recreate one in a click.</div>
        </div>
        <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">Browse presets →</span>
      </Link>
    </div>
  );
}

export default function VideoTool() {
  const params = useSearchParams();
  const { jobs, generate, now } = useApp();
  const fx = EFFECTS.find((e) => e.id === params.get("effect") && e.kind === "video");
  const videoModels = MODELS.filter((m) => m.kind === "video");

  const [tab, setTab] = useState<Tab>("create");
  const right = useRightTab("video");
  const [error, setError] = useState("");

  // Create
  const [presetId, setPresetId] = useState("general");
  const [picking, setPicking] = useState(false);
  const [refMode, setRefMode] = useState<"refs" | "extend">("refs");
  const [refs, setRefs] = useState<Upload[]>([]);
  const [extendId, setExtendId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(fx?.prompt ?? params.get("prompt") ?? "");
  const [modelId, setModelId] = useState(videoModels.find((m) => m.id === params.get("model"))?.id ?? "seed");
  const [ratio, setRatio] = useState<Ratio>("16:9");
  const [seconds, setSeconds] = useState(5);
  const [res, setRes] = useState<Res>("720p");
  // Edit
  const [clip, setClip] = useState<Upload[]>([]);
  const [instruction, setInstruction] = useState("");
  const [look, setLook] = useState("None");
  // Motion
  const [photo, setPhoto] = useState<Upload[]>([]);
  const [motionId, setMotionId] = useState(MOTIONS[0].id);
  const [motionNote, setMotionNote] = useState("");

  const preset = VIDEO_PRESETS.find((p) => p.id === presetId)!;
  const model = MODELS.find((m) => m.id === modelId)!;
  const kling = MODELS.find((m) => m.id === "kling")!;
  const motion = MOTIONS.find((m) => m.id === motionId)!;
  const doneVideos = jobs.filter((j) => j.kind === "video" && jobStatus(j, now).status === "done").slice(0, 8);
  const extendJob = doneVideos.find((j) => j.id === extendId);
  const editSecs = Math.min(10, Math.max(1, Math.round(clip[0]?.secs ?? 5)));

  const cost =
    tab === "create" ? price(model, { seconds, res }) : tab === "edit" ? price(kling, { seconds: editSecs }) : price(kling, { seconds: 5 });

  const pickModel = (id: string) => {
    setModelId(id);
    const m = MODELS.find((x) => x.id === id)!;
    if (m.durations && !m.durations.includes(seconds)) setSeconds(m.durations[0]);
  };

  const run = (job: Parameters<typeof generate>[0]) => {
    const r = generate(job);
    setError(r.ok ? "" : (r.error ?? ""));
    if (r.ok) {
      right.set("history");
      if (window.innerWidth < 1024) document.getElementById("tool-results")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const submit = () => {
    if (tab === "create") {
      const text = [prompt.trim(), preset.prompt].filter(Boolean).join(", ");
      if (!text) return setError("Write a prompt or pick a preset");
      run({
        kind: "video",
        modelId,
        prompt: extendJob ? `Extend: ${extendJob.prompt}${prompt.trim() ? `, then ${prompt.trim()}` : ""}` : text,
        ratio: extendJob ? extendJob.ratio : ratio,
        seconds,
        count: 1,
        res,
        refs: refMode === "refs" && refs.length ? refs.length : undefined,
        topic: extendJob?.topic ?? (preset.id !== "general" ? preset.topic : undefined),
        tool: extendJob ? "Extend" : preset.id !== "general" ? preset.name : undefined,
        hue: fx && fx.prompt === prompt ? fx.hue : undefined,
      });
    } else if (tab === "edit") {
      if (!clip[0]) return setError("Upload the clip you want to edit");
      run({
        kind: "video",
        modelId: "kling",
        prompt: instruction.trim() || `Edit ${clip[0].name}`,
        ratio: "16:9",
        seconds: editSecs,
        count: 1,
        source: clip[0].url,
        style: look === "None" ? undefined : look,
        tool: "Edit Video",
      });
    } else {
      if (!photo[0]) return setError("Upload a photo of your character");
      run({
        kind: "video",
        modelId: "kling",
        prompt: `${photo[0].name.replace(/\.\w+$/, "")} performs a ${motion.name.toLowerCase()}${motionNote.trim() ? `, ${motionNote.trim()}` : ""}`,
        ratio: "9:16",
        seconds: 5,
        count: 1,
        refs: 1,
        topic: motion.topic,
        tool: "Motion Control",
      });
    }
  };

  const reuse = (j: Job) => {
    setTab("create");
    setPrompt(j.prompt);
    if (videoModels.some((m) => m.id === j.modelId)) pickModel(j.modelId);
    setRatio(j.ratio);
    setSeconds(j.seconds);
    if (j.res) setRes(j.res);
  };

  const body =
    tab === "create" ? (
      <>
        <div className="relative h-40 overflow-hidden rounded-2xl sm:h-44">
          <Media item={byTopic(preset.topic, preset.i, "video")} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <button onClick={() => setPicking(true)} className="absolute right-3 top-3 rounded-xl bg-black/60 px-3 py-1.5 text-sm font-medium backdrop-blur hover:bg-black/80">
            ✎ Change
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="text-2xl font-black uppercase text-accent">{preset.name}</div>
            <div className="text-sm text-white/80">
              {preset.id === "general" ? "Manual control" : `+ ${preset.prompt}`} · {model.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/30 p-1">
          {(
            [
              ["refs", "References"],
              ["extend", "Extend Video"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setRefMode(k)} className={`rounded-xl py-2.5 text-sm font-semibold ${refMode === k ? "bg-white/10" : "text-mute hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>
        {refMode === "refs" ? (
          <DropZone accept={["image", "video", "audio"]} max={3} files={refs} onChange={setRefs} title="Add references" sub="Image, video or audio · up to 3" optional />
        ) : doneVideos.length ? (
          <div>
            <span className={label}>Pick a clip to continue</span>
            <div className="grid grid-cols-4 gap-2">
              {doneVideos.map((j) => (
                <button key={j.id} onClick={() => setExtendId(extendId === j.id ? null : j.id)} title={j.prompt} className={`aspect-square overflow-hidden rounded-xl border-2 ${extendId === j.id ? "border-accent" : "border-transparent"}`}>
                  <Media item={jobMedia(j, j.seeds[0])} ratio="1:1" width={160} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-4 text-center text-sm text-mute">Generate a video first, then extend it here.</p>
        )}

        <div>
          <span className={label}>{extendJob ? "What happens next (optional)" : "Prompt"}</span>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} maxLength={800} placeholder="A lone astronaut walks through a neon market in the rain…" className={box} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown
            side="bottom"
            className="w-80"
            trigger={(open, toggle) => (
              <button onClick={toggle} className={chipCls(open)}>
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-[9px] font-black text-black">{model.mark}</span>
                {model.name}
              </button>
            )}
          >
            {(close) => (
              <div>
                {videoModels.map((m) => (
                  <button key={m.id} className={rowCls(m.id === modelId)} onClick={() => (pickModel(m.id), close())}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[10px] font-black">{m.mark}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-medium">
                        {m.name}
                        {m.tag && <span className="rounded bg-accent px-1 text-[9px] font-black text-black">{m.tag}</span>}
                      </span>
                      <span className="block truncate text-xs text-mute">{m.blurb}</span>
                    </span>
                    <span className="text-xs text-mute">{fmt(m.cost)}/s</span>
                  </button>
                ))}
              </div>
            )}
          </Dropdown>
          {!extendJob && (
            <Dropdown
              side="bottom"
              className="w-44"
              trigger={(open, toggle) => (
                <button onClick={toggle} className={chipCls(open)}>
                  ▭ {ratio}
                </button>
              )}
            >
              {(close) => (
                <div>
                  {RATIOS.map((r) => (
                    <button key={r} className={rowCls(r === ratio)} onClick={() => (setRatio(r), close())}>
                      {r} {r === ratio && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </Dropdown>
          )}
          <div className="flex rounded-xl border border-line bg-[#1a1a1e] p-1">
            {model.durations!.map((d) => (
              <button key={d} onClick={() => setSeconds(d)} className={`rounded-lg px-3 py-1.5 text-sm ${seconds === d ? "bg-white/15 font-semibold" : "text-mute hover:text-white"}`}>
                {d}s
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-line bg-[#1a1a1e] p-1">
            {VIDEO_RES.map((r) => (
              <button key={r} onClick={() => setRes(r)} className={`rounded-lg px-3 py-1.5 text-sm ${res === r ? "bg-white/15 font-semibold" : "text-mute hover:text-white"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </>
    ) : tab === "edit" ? (
      <>
        <DropZone accept={["video"]} max={1} files={clip} onChange={setClip} title="Upload a clip" sub="MP4, MOV or WebM · up to 10s billed" />
        {clip[0] && (
          <div className="overflow-hidden rounded-2xl">
            <video src={clip[0].url} muted autoPlay loop playsInline className="aspect-video w-full object-cover" style={{ filter: look === "None" ? undefined : STYLE_FILTERS[look] }} />
          </div>
        )}
        <div>
          <span className={label}>What should change?</span>
          <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={3} maxLength={500} placeholder="Make it night time, add rain, keep the actor's motion" className={box} />
        </div>
        <div>
          <span className={label}>Look</span>
          <div className="flex flex-wrap gap-1.5">
            {EDIT_LOOKS.map((l) => (
              <button key={l} onClick={() => setLook(l)} className={`rounded-full border px-3 py-1.5 text-sm ${look === l ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`}>
                {l}
              </button>
            ))}
          </div>
          <p className="mt-2 px-1 text-xs text-mute">The preview above updates live. For 18 full restyles, use Genjutsu.</p>
        </div>
      </>
    ) : (
      <>
        <DropZone accept={["image"]} max={1} files={photo} onChange={setPhoto} title="Upload your character" sub="A clear, full-body photo works best" />
        <div>
          <span className={label}>Motion</span>
          <div className="grid grid-cols-3 gap-2">
            {MOTIONS.map((m) => (
              <button key={m.id} onClick={() => setMotionId(m.id)} className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 ${motionId === m.id ? "border-accent" : "border-transparent"}`}>
                <Media item={byTopic(m.topic, m.i, "video")} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-1.5 text-xs font-semibold">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={label}>Details (optional)</span>
          <input value={motionNote} onChange={(e) => setMotionNote(e.target.value)} maxLength={200} placeholder="on a rooftop at sunset" className={box} />
        </div>
      </>
    );

  const reason = tab === "edit" && !clip[0] ? "Upload a clip to continue" : tab === "motion" && !photo[0] ? "Upload a character photo to continue" : undefined;

  return (
    <>
      <ToolShell
        kind="video"
        tabs={TABS}
        tab={tab}
        onTab={(t) => (setTab(t as Tab), setError(""))}
        right={right.value}
        onRight={right.set}
        onReuse={reuse}
        how={<How />}
        body={body}
        footer={
          <>
            {error && (
              <p role="alert" className="mb-2 text-center text-sm text-red-400">
                {error}
              </p>
            )}
            <PriceButton list={cost.list} charge={cost.charge} disabled={!!reason} reason={reason} onClick={submit} next="/video" />
          </>
        }
      />
      {picking && <PresetPicker value={presetId} onPick={(p) => setPresetId(p.id)} onClose={() => setPicking(false)} />}
    </>
  );
}
