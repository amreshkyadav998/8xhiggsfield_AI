"use client";
import { useState } from "react";
import { artUrl } from "@/lib/art";
import { MODELS, ratioBox } from "@/lib/catalog";
import { jobStatus, useApp, type Job } from "@/lib/store";

export default function JobCard({ job }: { job: Job }) {
  const { now, cancel, remove } = useApp();
  const [open, setOpen] = useState<number | null>(null);
  const { status, progress } = jobStatus(job, now);
  const model = MODELS.find((m) => m.id === job.modelId)!;
  const box = ratioBox(job.ratio);
  const video = job.kind === "video";

  return (
    <article className="rounded-xl border border-line bg-panel p-3">
      <div className="mb-3 flex items-start gap-3">
        <p className="line-clamp-2 flex-1 text-sm">{job.prompt}</p>
        <button onClick={() => remove(job.id)} aria-label="Delete" className="text-mute hover:text-white">
          ✕
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-mute">
        <span className="rounded bg-black/40 px-2 py-0.5">{model.name}</span>
        <span className="rounded bg-black/40 px-2 py-0.5">{job.ratio}</span>
        {video && <span className="rounded bg-black/40 px-2 py-0.5">{job.seconds}s</span>}
        <span className="rounded bg-black/40 px-2 py-0.5">
          {status === "canceled" ? "refunded " : ""}
          {job.cost} cr
        </span>
      </div>

      {status === "done" ? (
        <div className={`grid gap-2 ${job.count > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {job.seeds.map((s, i) => (
            <button key={s} onClick={() => setOpen(i)} className="relative overflow-hidden rounded-lg" style={{ aspectRatio: box.css }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artUrl(job.prompt, s, video, job.hue)} alt={job.prompt} className="h-full w-full object-cover" />
              {video && <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px]">▶ {job.seconds}s</span>}
            </button>
          ))}
        </div>
      ) : status === "canceled" ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-line py-8 text-sm text-mute">Canceled, credits refunded</div>
      ) : (
        <div className="shimmer relative grid place-items-center rounded-lg" style={{ aspectRatio: box.css }}>
          <div className="w-2/3 text-center text-xs text-mute">
            {status === "queued" ? "In queue…" : `Rendering ${Math.round(progress * 100)}%`}
            <div className="mt-2 h-1 overflow-hidden rounded bg-black/50">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
            <button onClick={() => cancel(job.id)} className="mt-3 underline hover:text-white">
              Cancel and refund
            </button>
          </div>
        </div>
      )}

      {open !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-6" onClick={() => setOpen(null)} role="dialog" aria-label="Preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artUrl(job.prompt, job.seeds[open], video, job.hue)}
            alt={job.prompt}
            className="max-w-full rounded-xl object-cover"
            style={{ aspectRatio: box.css, maxHeight: "85vh" }}
          />
        </div>
      )}
    </article>
  );
}
