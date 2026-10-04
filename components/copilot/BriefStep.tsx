"use client";
import Link from "next/link";
import { useState } from "react";
import DropZone, { type Upload } from "@/components/tool/DropZone";
import Media from "@/components/Media";
import { jobMedia } from "@/components/JobCard";
import { EXAMPLE_BRIEFS, GOALS, PLATFORMS, TONES, type Brief } from "@/lib/creatorCopilotMockData";
import { byTopic } from "@/lib/media";
import { jobStatus, useApp } from "@/lib/store";
import type { VideoRef } from "@/lib/copilot";
import { VideoThumb, btnPrimary } from "./ui";

const SAMPLES = [
  { topic: "neon", i: 3, name: "sample-creator-reel.mp4" },
  { topic: "sport", i: 2, name: "sample-fitness-ad.mp4" },
  { topic: "product", i: 0, name: "sample-product-teaser.mp4" },
];

const field = "w-full rounded-xl border border-line bg-black/30 px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-mute focus:border-white/30";
const lbl = "mb-1.5 block text-sm text-mute";

export default function BriefStep({ initialAsset, onAnalyze }: { initialAsset?: string; onAnalyze: (b: Brief, v: VideoRef) => void }) {
  const { jobs, now } = useApp();
  const [brief, setBrief] = useState<Brief>(EXAMPLE_BRIEFS[0].brief);
  const assets = jobs.filter((j) => j.kind === "video" && jobStatus(j, now).status === "done").flatMap((j) => j.seeds.map((seed) => ({ job: j, seed })));

  const [mode, setMode] = useState<"upload" | "assets" | "sample">(initialAsset ? "assets" : "upload");
  const [upload, setUpload] = useState<Upload[]>([]);
  const [video, setVideo] = useState<VideoRef | null>(() => {
    if (!initialAsset) return null;
    const [jobId, seed] = initialAsset.split(":");
    return { source: "asset", jobId, seed: Number(seed), name: "Generated video" };
  });
  const [err, setErr] = useState("");

  // A clip preselected from the URL only knows its id; fill name and aspect from the job once the store has it.
  const withJobInfo = (v: VideoRef): VideoRef => {
    if (v.source !== "asset") return v;
    const job = jobs.find((j) => j.id === v.jobId);
    return job ? { ...v, name: job.prompt.slice(0, 40), ratio: job.ratio } : v;
  };
  const set = (k: keyof Brief) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setBrief({ ...brief, [k]: e.target.value });
  const onUpload = (u: Upload[]) => {
    setUpload(u);
    setVideo(u[0] ? { source: "upload", url: u[0].url, name: u[0].name, secs: u[0].secs } : null);
  };
  const submit = () => {
    if (!brief.brand.trim() || !brief.message.trim()) return setErr("Add the brand and the required message");
    if (!video) return setErr("Upload a video or pick one to analyze");
    setErr("");
    onAnalyze({ ...brief, brand: brief.brand.trim(), message: brief.message.trim() }, withJobInfo(video));
  };

  const tab = (on: boolean) => `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${on ? "bg-white/10" : "text-mute hover:text-white"}`;

  return (
    <div className="cp-fade-up grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">The brief</h2>
            <p className="text-sm text-mute">What the video must achieve. Copilot scores against this.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_BRIEFS.map((e) => (
              <button key={e.id} onClick={() => setBrief(e.brief)} className={`rounded-full border px-3 py-1 text-xs ${brief.brand === e.brief.brand ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`}>
                {e.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={lbl}>Brand / Product</span>
            <input value={brief.brand} onChange={set("brand")} maxLength={80} className={field} />
          </label>
          <label>
            <span className={lbl}>Target audience</span>
            <input value={brief.audience} onChange={set("audience")} maxLength={80} className={field} />
          </label>
          <label>
            <span className={lbl}>Platform</span>
            <select value={brief.platform} onChange={set("platform")} className={field}>
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={lbl}>Goal</span>
            <select value={brief.goal} onChange={set("goal")} className={field}>
              {GOALS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={lbl}>Tone</span>
            <select value={brief.tone} onChange={set("tone")} className={field}>
              {TONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={lbl}>Required message</span>
            <input value={brief.message} onChange={set("message")} maxLength={140} className={field} />
          </label>
        </div>
      </section>

      <section className="flex flex-col rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">Your video</h2>
        <div className="mt-4 flex gap-1 rounded-2xl border border-line bg-black/30 p-1">
          <button onClick={() => setMode("upload")} className={tab(mode === "upload")}>
            Upload
          </button>
          <button onClick={() => setMode("assets")} className={tab(mode === "assets")}>
            From Assets {assets.length > 0 && <span className="text-mute">({assets.length})</span>}
          </button>
          <button onClick={() => setMode("sample")} className={tab(mode === "sample")}>
            Sample
          </button>
        </div>

        <div className="mt-4 flex-1">
          {mode === "upload" ? (
            <DropZone accept={["video"]} max={1} files={upload} onChange={onUpload} title="Upload video" sub="MP4, MOV or WebM · stays in your browser" />
          ) : mode === "assets" ? (
            assets.length ? (
              <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
                {assets.map(({ job, seed }) => {
                  const on = video?.source === "asset" && video.jobId === job.id && video.seed === seed;
                  return (
                    <button
                      key={`${job.id}:${seed}`}
                      title={job.prompt}
                      onClick={() => setVideo({ source: "asset", jobId: job.id, seed, name: job.prompt.slice(0, 40), ratio: job.ratio })}
                      className={`relative aspect-[4/5] overflow-hidden rounded-xl border-2 ${on ? "border-accent" : "border-transparent hover:border-white/30"}`}
                    >
                      <Media item={jobMedia(job, seed)} />
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px]">{job.ratio}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-mute">
                No finished videos in Assets yet.{" "}
                <Link href="/video" className="text-accent underline">
                  Generate one
                </Link>{" "}
                or try a sample.
              </div>
            )
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {SAMPLES.map((s) => {
                const on = video?.source === "sample" && video.name === s.name;
                return (
                  <button key={s.name} onClick={() => setVideo({ source: "sample", ...s })} className={`relative aspect-[4/5] overflow-hidden rounded-xl border-2 ${on ? "border-accent" : "border-transparent hover:border-white/30"}`}>
                    <Media item={byTopic(s.topic, s.i, "video")} />
                  </button>
                );
              })}
            </div>
          )}

          {video && mode !== "upload" && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-2">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                <VideoThumb video={video} />
              </div>
              <div className="min-w-0 text-sm">
                <div className="text-xs text-accent">Selected</div>
                <div className="truncate">{withJobInfo(video).name}</div>
              </div>
            </div>
          )}
        </div>

        {err && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {err}
          </p>
        )}
        <button onClick={submit} className={`${btnPrimary} mt-5 w-full py-4 text-lg`}>
          Analyze My Video →
        </button>
      </section>
    </div>
  );
}
