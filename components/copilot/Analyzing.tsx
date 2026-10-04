"use client";
import { useEffect, useState } from "react";
import { ANALYSIS_STEPS, type Brief } from "@/lib/creatorCopilotMockData";
import { analyzeVideo, type Analysis, type VideoRef } from "@/lib/copilot";
import { VideoThumb } from "./ui";

const TOTAL = 4200;

export default function Analyzing({ brief, video, onDone }: { brief: Brief; video: VideoRef; onDone: (a: Analysis) => void }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    let alive = true;
    const per = TOTAL / ANALYSIS_STEPS.length;
    const timers = ANALYSIS_STEPS.map((_, i) => setTimeout(() => alive && setDone(i + 1), per * (i + 1) - 150));
    analyzeVideo(brief, video, TOTAL + 250).then((a) => alive && onDone(a));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
    // Runs once per mount; brief/video are fixed for this sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round((done / ANALYSIS_STEPS.length) * 100);
  return (
    <div className="cp-fade-up mx-auto grid max-w-5xl items-center gap-8 rounded-3xl border border-line bg-panel p-5 sm:p-8 md:grid-cols-2" aria-live="polite">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black md:aspect-[3/4]">
        <VideoThumb video={video} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="cp-scan pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        <div className="absolute inset-x-4 bottom-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 truncate text-xs text-white/70">{video.name}</div>
        </div>
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-accent">02 · Analyze</div>
        <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">Analyzing your video…</h2>
        <p className="mt-2 text-mute">Checking it against the {brief.brand} brief for {brief.platform}.</p>
        <ul className="mt-6 space-y-3">
          {ANALYSIS_STEPS.map((s, i) => {
            const state = i < done ? "done" : i === done ? "active" : "todo";
            return (
              <li key={s} className={`flex items-center gap-3 transition-opacity duration-300 ${state === "todo" ? "opacity-35" : "opacity-100"}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm ${state === "done" ? "cp-pop bg-accent text-black" : "border border-line"}`}>
                  {state === "done" ? "✓" : state === "active" ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" /> : ""}
                </span>
                <span className={state === "active" ? "font-semibold text-white" : ""}>{s}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
