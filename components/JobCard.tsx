"use client";
import { useState } from "react";
import { waveUrl } from "@/lib/art";
import { MODELS, VOICES, fmt, ratioBox } from "@/lib/catalog";
import { pick, photoUrl, STYLE_FILTERS, type MediaItem } from "@/lib/media";
import { playScore, playSource, playVoice, stopAudio } from "@/lib/audio";
import { jobStatus, useApp, type Job } from "@/lib/store";
import Media from "@/components/Media";

export function jobMedia(job: Job, seed: number): MediaItem {
  return pick(job.prompt, job.kind === "audio" ? "image" : job.kind, seed, job.topic);
}

export function downloadHref(item: MediaItem) {
  return item.type === "video" ? item.hd : photoUrl(item.src, "4:5", 1600);
}

export function Output({ job, seed, onOpen }: { job: Job; seed: number; onOpen: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [sourceOk, setSourceOk] = useState(!!job.source);
  const box = ratioBox(job.ratio);

  if (job.kind === "audio") {
    const toggle = () => {
      if (playing) return stopAudio();
      setPlaying(true);
      const done = () => setPlaying(false);
      const v = VOICES.find((x) => x.id === job.voice);
      if (job.source) playSource(job.source, v?.pitch ?? 1, done, () => setSourceOk(false));
      else if (job.modelId === "voice") playVoice(job.prompt, v ? VOICES.indexOf(v) : seed, done, v && { ...v, rate: v.rate * (job.rate ?? 1) });
      else playScore(seed, done);
    };
    return (
      <button onClick={toggle} className="group relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "16 / 7" }} aria-label={playing ? "Stop" : "Play"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={waveUrl(job.prompt, seed)} alt="" className={`h-full w-full object-cover ${playing ? "animate-pulse" : ""}`} />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg text-black shadow-xl transition-transform group-hover:scale-110">{playing ? "■" : "▶"}</span>
        </span>
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px]">
          {job.tool ?? (job.modelId === "voice" ? "Voiceover" : "Score · 10s")}
          {job.voice ? ` · ${VOICES.find((x) => x.id === job.voice)?.name}` : ""}
          {job.source && !sourceOk ? " · source expired" : ""}
        </span>
      </button>
    );
  }

  const filter = job.style ? STYLE_FILTERS[job.style] : undefined;
  return (
    <button onClick={onOpen} className="relative block w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: box.css }}>
      {job.source && sourceOk ? (
        <video src={job.source} muted loop autoPlay playsInline onError={() => setSourceOk(false)} className="h-full w-full object-cover" style={{ filter }} />
      ) : (
        <Media item={jobMedia(job, seed)} ratio={job.ratio} width={job.count > 1 ? 500 : 900} filter={filter} />
      )}
      {job.kind === "video" && <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px]">▶ {job.seconds}s</span>}
    </button>
  );
}

export default function JobCard({ job }: { job: Job }) {
  const { now, cancel, remove } = useApp();
  const [open, setOpen] = useState<number | null>(null);
  const { status, progress } = jobStatus(job, now);
  const model = MODELS.find((m) => m.id === job.modelId)!;
  const box = ratioBox(job.ratio);
  const openItem = open !== null ? jobMedia(job, job.seeds[open]) : null;

  return (
    <article className="rounded-xl border border-line bg-panel p-3">
      <div className="mb-3 flex items-start gap-3">
        <p className="line-clamp-2 flex-1 text-sm">{job.prompt}</p>
        <button onClick={() => remove(job.id)} aria-label="Delete" className="text-mute hover:text-white">
          ✕
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-mute">
        <span className="rounded bg-black/40 px-2 py-0.5">{job.style ? `Genjutsu · ${job.style}` : model.name}</span>
        {job.kind !== "audio" && <span className="rounded bg-black/40 px-2 py-0.5">{job.ratio}</span>}
        {job.kind === "video" && <span className="rounded bg-black/40 px-2 py-0.5">{job.seconds}s</span>}
        <span className="rounded bg-black/40 px-2 py-0.5">
          {status === "canceled" ? "refunded " : ""}
          {fmt(job.cost)} cr
        </span>
      </div>

      {status === "done" ? (
        <div className={`grid gap-2 ${job.count > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {job.seeds.map((s, i) => (
            <Output key={s} job={job} seed={s} onOpen={() => setOpen(i)} />
          ))}
        </div>
      ) : status === "canceled" ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-line py-8 text-sm text-mute">Canceled, credits refunded</div>
      ) : (
        <div className="shimmer relative grid place-items-center rounded-lg" style={{ aspectRatio: job.kind === "audio" ? "16 / 7" : box.css }}>
          <div className="w-2/3 text-center text-xs text-mute">
            {status === "queued" ? "In queue…" : `${job.kind === "audio" ? "Composing" : "Rendering"} ${Math.round(progress * 100)}%`}
            <div className="mt-2 h-1 overflow-hidden rounded bg-black/50">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
            <button onClick={() => cancel(job.id)} className="mt-3 underline hover:text-white">
              Cancel and refund
            </button>
          </div>
        </div>
      )}

      {openItem && open !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-6" onClick={() => setOpen(null)} role="dialog" aria-label="Preview">
          <div className="max-h-[78vh] max-w-full overflow-hidden rounded-xl" style={{ aspectRatio: box.css, height: "78vh" }} onClick={(e) => e.stopPropagation()}>
            {job.source ? (
              <video src={job.source} controls autoPlay loop playsInline className="h-full w-full object-contain" style={{ filter: job.style ? STYLE_FILTERS[job.style] : undefined }} />
            ) : (
              <Media item={openItem} ratio={job.ratio} width={1400} hd controls filter={job.style ? STYLE_FILTERS[job.style] : undefined} />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm" onClick={(e) => e.stopPropagation()}>
            <a href={downloadHref(openItem)} target="_blank" rel="noreferrer" className="rounded-lg bg-accent px-4 py-2 font-semibold text-black">
              Download
            </a>
            <a href={openItem.link} target="_blank" rel="noreferrer" className="text-mute hover:text-white">
              {openItem.type === "photo" ? `Photo: ${openItem.by} / Unsplash` : "Clip: Mixkit"}
            </a>
            <button onClick={() => setOpen(null)} className="rounded-lg border border-line px-4 py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
