"use client";
import { useEffect, useState } from "react";
import Media from "@/components/Media";
import { VIDEO_PRESETS, type VideoPreset } from "@/lib/catalog";
import { byTopic } from "@/lib/media";

const CATS = ["All", "Camera", "VFX", "Framing"] as const;

/** Full-screen preset browser: live clip previews, category filter, search. */
export default function PresetPicker({ value, onPick, onClose }: { value: string; onPick: (p: VideoPreset) => void; onClose: () => void }) {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [q, setQ] = useState("");
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const list = VIDEO_PRESETS.filter((p) => (cat === "All" || p.cat === cat || p.cat === "General") && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90 backdrop-blur" role="dialog" aria-modal aria-label="Choose a preset">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden p-3 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-2xl font-black uppercase">Presets</h2>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search presets" className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent sm:w-64" />
          <button onClick={onClose} className="rounded-xl border border-line px-4 py-2.5 text-sm hover:border-white" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${cat === c ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 grid flex-1 auto-rows-max grid-cols-2 gap-3 overflow-y-auto pb-6 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => (onPick(p), onClose())}
              className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border-2 text-left ${value === p.id ? "border-accent" : "border-transparent hover:border-white/30"}`}
            >
              <Media item={byTopic(p.topic, p.i, "video")} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
                <div className="text-[10px] uppercase tracking-widest text-accent">{p.cat}</div>
                <div className="font-bold uppercase">{p.name}</div>
                {p.prompt && <div className="line-clamp-1 text-xs text-white/60">+ {p.prompt}</div>}
              </div>
              {value === p.id && <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black">Selected</span>}
            </button>
          ))}
          {list.length === 0 && <p className="col-span-full py-10 text-center text-mute">No presets match “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}
