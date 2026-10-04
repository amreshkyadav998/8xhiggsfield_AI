"use client";
import { useEffect, useState } from "react";
import { MODELS, fmt, ratioBox } from "@/lib/catalog";
import { STYLE_FILTERS } from "@/lib/media";
import { jobStatus, markKey, useApp, type Job } from "@/lib/store";
import Media from "@/components/Media";
import { Output, downloadHref, jobMedia } from "@/components/JobCard";

export interface Item {
  job: Job;
  seed: number;
}

const iconBtn = "grid h-9 w-9 place-items-center rounded-lg bg-black/60 text-sm backdrop-blur transition-colors hover:bg-black/80";

function Tile({ item, onOpen, onReuse }: { item: Item; onOpen: () => void; onReuse: (j: Job) => void }) {
  const { now, cancel, remove, marks, toggleLike, markDownloaded } = useApp();
  const { job, seed } = item;
  const { status, progress } = jobStatus(job, now);
  const key = markKey(job, seed);
  const box = job.kind === "audio" ? "16 / 7" : ratioBox(job.ratio).css;

  if (status === "queued" || status === "rendering")
    return (
      <div className="shimmer relative mb-3 grid break-inside-avoid place-items-center overflow-hidden rounded-2xl" style={{ aspectRatio: box }}>
        <div className="w-2/3 text-center text-xs text-mute">
          <div className="line-clamp-1 text-white/70">{job.prompt}</div>
          <div className="mt-1">{status === "queued" ? "In queue…" : `Generating ${Math.round(progress * 100)}%`}</div>
          <div className="mt-2 h-1 overflow-hidden rounded bg-black/50">
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress * 100}%` }} />
          </div>
          {seed === job.seeds[0] && (
            <button onClick={() => cancel(job.id)} className="mt-3 underline hover:text-white">
              Cancel · refund {fmt(job.cost)}
            </button>
          )}
        </div>
      </div>
    );

  if (status === "canceled")
    return (
      <div className="relative mb-3 grid break-inside-avoid place-items-center rounded-2xl border border-dashed border-red-500/40 bg-red-500/5 p-4 text-center text-sm" style={{ aspectRatio: box }}>
        <div>
          <div className="font-semibold text-red-300">Failed · canceled</div>
          <div className="mt-1 text-xs text-mute">{fmt(job.cost)} credits refunded</div>
          <button onClick={() => remove(job.id)} className="mt-3 text-xs underline text-mute hover:text-white">
            Remove
          </button>
        </div>
      </div>
    );

  const m = marks[key];
  const media = jobMedia(job, seed);
  return (
    <div className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl">
      <Output job={job} seed={seed} onOpen={onOpen} />
      {job.kind !== "audio" && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="line-clamp-2 text-xs">{job.prompt}</p>
          </div>
          <div className="absolute right-2 top-2 flex gap-1.5 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0">
            <button onClick={() => toggleLike(key)} aria-label={m?.liked ? "Unlike" : "Like"} className={`${iconBtn} ${m?.liked ? "text-pink-400" : ""}`}>
              {m?.liked ? "♥" : "♡"}
            </button>
            <a href={downloadHref(media)} target="_blank" rel="noreferrer" onClick={() => markDownloaded(key)} aria-label="Download" className={iconBtn}>
              ⤓
            </a>
            <button onClick={() => onReuse(job)} aria-label="Reuse prompt" className={iconBtn}>
              ↺
            </button>
            <button onClick={() => remove(job.id)} aria-label="Delete generation" className={`${iconBtn} hover:bg-red-500/70`}>
              ✕
            </button>
          </div>
        </>
      )}
      {m?.liked && <span className="pointer-events-none absolute left-2 top-2 text-pink-400 drop-shadow group-hover:hidden">♥</span>}
    </div>
  );
}

function Lightbox({ items, index, onClose, onReuse }: { items: Item[]; index: number; onClose: () => void; onReuse: (j: Job) => void }) {
  const [i, setI] = useState(index);
  const { marks, toggleLike, markDownloaded } = useApp();
  const { job, seed } = items[i];
  const model = MODELS.find((m) => m.id === job.modelId);
  const media = jobMedia(job, seed);
  const key = markKey(job, seed);
  const filter = job.style ? STYLE_FILTERS[job.style] : undefined;

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => Math.min(items.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [items.length, onClose]);

  const rows: [string, string][] = [
    ["Model", job.style ? `Genjutsu · ${job.style}` : (model?.name ?? job.modelId)],
    ["Aspect", job.ratio],
    ...(job.kind === "video" ? ([["Duration", `${job.seconds}s`]] as [string, string][]) : []),
    ...(job.quality ? ([["Quality", job.quality]] as [string, string][]) : []),
    ...(job.res ? ([["Resolution", job.res]] as [string, string][]) : []),
    ...(job.refs ? ([["References", String(job.refs)]] as [string, string][]) : []),
    ["Cost", `${fmt(job.cost)} credits`],
    ["Created", new Date(job.startedAt).toLocaleString()],
  ];

  return (
    <div className="fixed inset-0 z-[60] flex bg-black/95 max-md:flex-col" role="dialog" aria-modal aria-label="Preview">
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 md:p-6" onClick={onClose}>
        <div className="h-full max-h-[86vh] max-w-full overflow-hidden rounded-xl" style={{ aspectRatio: ratioBox(job.ratio).css }} onClick={(e) => e.stopPropagation()}>
          {job.source ? (
            <video src={job.source} controls autoPlay loop playsInline className="h-full w-full object-contain" style={{ filter }} />
          ) : (
            <Media item={media} ratio={job.ratio} width={1600} hd controls filter={filter} />
          )}
        </div>
        {i > 0 && (
          <button onClick={(e) => (e.stopPropagation(), setI(i - 1))} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20" aria-label="Previous">
            ‹
          </button>
        )}
        {i < items.length - 1 && (
          <button onClick={(e) => (e.stopPropagation(), setI(i + 1))} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20" aria-label="Next">
            ›
          </button>
        )}
      </div>
      <aside className="w-full shrink-0 overflow-y-auto border-line bg-[#0f0f12] p-5 max-md:max-h-[45vh] max-md:border-t md:w-96 md:border-l md:p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-mute">
            {i + 1} / {items.length}
          </span>
          <button onClick={onClose} className="rounded-lg border border-line px-3 py-1 text-sm hover:border-white" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mt-6 text-xs uppercase tracking-widest text-mute">Prompt</div>
        <p className="mt-2 rounded-xl bg-white/5 p-3 text-sm leading-relaxed">{job.prompt}</p>
        <dl className="mt-5 space-y-2.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-mute">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button onClick={() => (onReuse(job), onClose())} className="col-span-2 rounded-xl bg-accent py-3 font-semibold text-black">
            ↺ Reuse prompt and settings
          </button>
          <a href={downloadHref(media)} target="_blank" rel="noreferrer" onClick={() => markDownloaded(key)} className="rounded-xl border border-line py-2.5 text-center text-sm hover:border-white">
            ⤓ Download
          </a>
          <button onClick={() => toggleLike(key)} className={`rounded-xl border py-2.5 text-sm ${marks[key]?.liked ? "border-pink-400 text-pink-400" : "border-line hover:border-white"}`}>
            {marks[key]?.liked ? "♥ Liked" : "♡ Like"}
          </button>
        </div>
        {job.kind === "video" && (
          <a href={`/creator-copilot?asset=${encodeURIComponent(`${job.id}:${seed}`)}`} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10">
            ✨ Analyze in Creator Copilot
          </a>
        )}
        <p className="mt-6 text-xs text-mute">
          Simulated output: {media.type === "photo" ? `photo by ${media.by} on Unsplash` : "clip from Mixkit"}.{" "}
          <a href={media.link} target="_blank" rel="noreferrer" className="underline">
            Source
          </a>
        </p>
      </aside>
    </div>
  );
}

export default function Feed({ items, cols, onReuse }: { items: Item[]; cols: number; onReuse: (j: Job) => void }) {
  const { now } = useApp();
  const [open, setOpen] = useState<number | null>(null);
  // Only finished visual outputs are browsable, so the lightbox never reveals a render early.
  const done = items.filter((x) => x.job.kind !== "audio" && jobStatus(x.job, now).status === "done");
  return (
    <>
      <div className="gap-3" style={{ columnCount: cols }}>
        {items.map((it) => (
          <Tile key={`${it.job.id}:${it.seed}`} item={it} onReuse={onReuse} onOpen={() => setOpen(done.indexOf(it))} />
        ))}
      </div>
      {open !== null && open >= 0 && <Lightbox items={done} index={open} onClose={() => setOpen(null)} onReuse={onReuse} />}
    </>
  );
}
