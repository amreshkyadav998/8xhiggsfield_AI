"use client";
import { useState } from "react";

export interface Upload {
  name: string;
  url: string;
  type: "image" | "video" | "audio";
  secs?: number;
}

const ICON = { image: "▣", video: "▶", audio: "♪" };

function typeOf(f: File): Upload["type"] | null {
  if (f.type.startsWith("image/")) return "image";
  if (f.type.startsWith("video/")) return "video";
  if (f.type.startsWith("audio/")) return "audio";
  return null;
}

/** Reads duration for audio/video so callers can price by length. */
function withDuration(u: Upload): Promise<Upload> {
  if (u.type === "image") return Promise.resolve(u);
  return new Promise((res) => {
    const el = document.createElement(u.type === "video" ? "video" : "audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => res({ ...u, secs: Number.isFinite(el.duration) ? el.duration : undefined });
    el.onerror = () => res(u);
    el.src = u.url;
  });
}

/** Drag-and-drop or click upload with typed previews. Files stay in the browser as blob URLs. */
export default function DropZone({
  accept,
  max,
  files,
  onChange,
  title,
  sub,
  optional,
  maxMB = 200,
}: {
  accept: Upload["type"][];
  max: number;
  files: Upload[];
  onChange: (f: Upload[]) => void;
  title: string;
  sub: string;
  optional?: boolean;
  maxMB?: number;
}) {
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);

  const add = async (list: FileList | null) => {
    if (!list) return;
    const ok: Upload[] = [];
    for (const f of [...list]) {
      const t = typeOf(f);
      if (!t || !accept.includes(t)) {
        setErr(`${f.name}: use ${accept.join(", ")}`);
        continue;
      }
      if (f.size > maxMB * 1024 * 1024) {
        setErr(`${f.name} is over ${maxMB} MB`);
        continue;
      }
      ok.push(await withDuration({ name: f.name, url: URL.createObjectURL(f), type: t }));
    }
    if (ok.length) setErr("");
    onChange([...files, ...ok].slice(0, max));
  };

  return (
    <div>
      {files.length < max && (
        <label
          onDragOver={(e) => (e.preventDefault(), setOver(true))}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            add(e.dataTransfer.files);
          }}
          className={`relative flex cursor-pointer flex-col items-center rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${over ? "border-accent bg-accent/5" : "border-white/15 bg-black/20 hover:border-white/30"}`}
        >
          {optional && <span className="absolute right-3 top-3 rounded-lg bg-white/10 px-2 py-0.5 text-xs text-mute">Optional</span>}
          <span className="flex">
            {accept.map((t) => (
              <span key={t} className="-mx-1 grid h-11 w-11 place-items-center rounded-full border-2 border-panel bg-white/10 text-sm">
                {ICON[t]}
              </span>
            ))}
          </span>
          <span className="mt-3 font-semibold">{title}</span>
          <span className="text-sm text-mute">{sub}</span>
          <input type="file" multiple={max > 1} accept={accept.map((t) => `${t}/*`).join(",")} className="sr-only" onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
        </label>
      )}
      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((f, i) => (
            <div key={f.url} className="flex items-center gap-3 rounded-xl border border-line bg-black/30 p-2">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/10">
                {f.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt="" className="h-full w-full object-cover" />
                ) : f.type === "video" ? (
                  <video src={f.url} muted className="h-full w-full object-cover" />
                ) : (
                  <span>♪</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{f.name}</div>
                <div className="text-xs text-mute">
                  {f.type}
                  {f.secs ? ` · ${f.secs.toFixed(1)}s` : ""}
                </div>
                {f.type === "audio" && <audio src={f.url} controls className="mt-1 h-8 w-full" />}
              </div>
              <button onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="self-start px-2 text-mute hover:text-white">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {err && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {err}
        </p>
      )}
    </div>
  );
}
