"use client";
import Link from "next/link";
import { useState } from "react";
import { waveUrl } from "@/lib/art";
import { MODELS, ratioBox, type Kind } from "@/lib/catalog";
import { STYLE_FILTERS } from "@/lib/media";
import { jobStatus, useApp } from "@/lib/store";
import Media from "@/components/Media";
import { downloadHref, jobMedia } from "@/components/JobCard";

const FILTERS: ("all" | Kind)[] = ["all", "image", "video", "audio"];

export default function Assets() {
  const { user, ready, jobs, now, remove } = useApp();
  const [f, setF] = useState<"all" | Kind>("all");
  const [q, setQ] = useState("");

  const items = jobs
    .filter((j) => jobStatus(j, now).status === "done")
    .filter((j) => f === "all" || j.kind === f)
    .filter((j) => j.prompt.toLowerCase().includes(q.toLowerCase()))
    .flatMap((j) => j.seeds.map((s) => ({ job: j, seed: s })));
  const running = jobs.filter((j) => ["queued", "rendering"].includes(jobStatus(j, now).status)).length;

  if (ready && !user)
    return (
      <div className="mx-auto mt-20 max-w-md px-4 text-center">
        <h1 className="text-2xl font-bold">Your assets live here</h1>
        <p className="mt-2 text-mute">Sign in to see everything you have generated.</p>
        <Link href="/login?next=/assets" className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 font-semibold text-black">
          Sign in
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-sm text-mute">
            {items.length} files{running ? ` · ${running} still rendering` : ""}
          </p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts" className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent sm:w-64" />
      </div>
      <div className="my-5 flex gap-2">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`rounded-full border px-4 py-1.5 text-sm capitalize ${f === x ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`}>
            {x}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-line text-sm text-mute">
          {jobs.length ? (
            "No matches."
          ) : (
            <Link href="/image" className="underline">
              Nothing yet. Generate your first image →
            </Link>
          )}
        </div>
      ) : (
        <div className="columns-2 gap-3 md:columns-3 xl:columns-4">
          {items.map(({ job, seed }) => {
            const item = jobMedia(job, seed);
            const audio = job.kind === "audio";
            return (
              <figure key={seed} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-line bg-panel">
                <div style={{ aspectRatio: audio ? "16 / 7" : ratioBox(job.ratio).css }}>
                  {audio ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={waveUrl(job.prompt, seed)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Media item={item} ratio={job.ratio} width={500} filter={job.style ? STYLE_FILTERS[job.style] : undefined} />
                  )}
                </div>
                <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <p className="line-clamp-2 text-xs">{job.prompt}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-mute">
                    <span className="capitalize">{job.kind}</span>·<span>{job.style ?? MODELS.find((m) => m.id === job.modelId)?.name}</span>
                    {!audio && (
                      <a href={downloadHref(item)} target="_blank" rel="noreferrer" className="ml-auto rounded bg-white/10 px-2 py-1 text-white hover:bg-white/20">
                        Download
                      </a>
                    )}
                    <button onClick={() => remove(job.id)} className={`${audio ? "ml-auto " : ""}rounded bg-white/10 px-2 py-1 text-white hover:bg-red-500/60`} aria-label="Delete generation">
                      ✕
                    </button>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
