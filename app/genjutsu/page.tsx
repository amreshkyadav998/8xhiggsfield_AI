"use client";
import { useState } from "react";
import { GENJUTSU_STYLES } from "@/lib/catalog";
import { PromptMedia } from "@/components/Media";
import { STYLE_FILTERS } from "@/lib/media";
import { useApp } from "@/lib/store";
import JobCard from "@/components/JobCard";
import { GenerateButton } from "@/components/Generator";

const COST_PER_SEC = 2;

export default function Genjutsu() {
  const { user, ready, jobs, generate } = useApp();
  const [file, setFile] = useState<{ name: string; url: string; secs: number } | null>(null);
  const [style, setStyle] = useState(GENJUTSU_STYLES[0]);
  const [error, setError] = useState("");
  const secs = Math.min(10, Math.max(1, Math.round(file?.secs ?? 5)));
  const cost = COST_PER_SEC * secs;
  const mine = jobs.filter((j) => j.prompt.startsWith("Restyle"));

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) return setError("Upload a video file (MP4, MOV, WebM)");
    if (f.size > 200 * 1024 * 1024) return setError("Max 200 MB");
    setError("");
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => setFile({ name: f.name, url, secs: v.duration || 5 });
    v.onerror = () => setFile({ name: f.name, url, secs: 5 });
    v.src = url;
  };
  const submit = () => {
    if (!file) return setError("Upload a clip first");
    const r = generate({
      kind: "video",
      modelId: "kling", // 2 cr/s, must match COST_PER_SEC
      prompt: `Restyle “${file.name}” as ${style}`,
      ratio: "16:9",
      seconds: secs,
      count: 1,
      style,
      source: file.url,
    });
    setError(r.ok ? "" : (r.error ?? ""));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <h1 className="text-3xl font-black uppercase">Genjutsu restyle</h1>
      <p className="text-mute">Keep the motion, change the world. Upload a clip (up to 10s billed), pick one of {GENJUTSU_STYLES.length} styles.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
            className="grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-panel text-center hover:border-mute"
          >
            {file ? (
              <video src={file.url} className="h-full w-full object-cover" autoPlay muted loop playsInline style={{ filter: STYLE_FILTERS[style] }} />
            ) : (
              <span className="text-sm text-mute">
                <span className="mb-2 block text-3xl">⇪</span>
                Drop a video here or click to upload
              </span>
            )}
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {file && (
            <div className="flex items-center justify-between text-xs text-mute">
              <span className="truncate">
                {file.name} · {file.secs.toFixed(1)}s
              </span>
              <button onClick={() => setFile(null)} className="underline hover:text-white">
                Remove
              </button>
            </div>
          )}
          <GenerateButton ready={ready} signedIn={!!user} cost={cost} disabled={!file || (!!user && user.credits < cost)} onClick={submit} next="/genjutsu" label="Restyle" />
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        <div>
          <span className="mb-2 block text-xs text-mute">Style · {GENJUTSU_STYLES.length}</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {GENJUTSU_STYLES.map((s, i) => (
              <button key={s} onClick={() => setStyle(s)} className={`relative aspect-square overflow-hidden rounded-lg border-2 ${style === s ? "border-accent" : "border-transparent"}`}>
                {file ? (
                  <video src={file.url} muted autoPlay loop playsInline className="h-full w-full object-cover" style={{ filter: STYLE_FILTERS[s] }} />
                ) : (
                  <PromptMedia prompt="dancer motion" seed={i % 3} ratio="1:1" width={200} filter={STYLE_FILTERS[s]} />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-1 text-[10px] font-semibold">{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-medium text-mute">Your restyles</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mine.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
