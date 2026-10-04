"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Media from "@/components/Media";
import { jobMedia } from "@/components/JobCard";
import { byTopic } from "@/lib/media";
import { useApp } from "@/lib/store";
import type { VideoRef } from "@/lib/copilot";

/** Renders overlays at <body> so page transforms/filters can't trap `position: fixed`. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}

// Same button language as Explore and the tools (lime with a pressed edge, quiet outline).
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-black shadow-[0_4px_0_#7a9400] transition-transform enabled:hover:-translate-y-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-panel px-5 py-3 font-semibold transition-colors hover:border-white/40";

export const tone = (n: number) => (n >= 90 ? "text-accent" : n >= 80 ? "text-white" : n >= 70 ? "text-amber-300" : "text-orange-400");
export const bar = (n: number) => (n >= 90 ? "bg-accent" : n >= 80 ? "bg-white" : n >= 70 ? "bg-amber-300" : "bg-orange-400");

/** Counts up to `to` on mount and whenever it changes. */
export function useCountUp(to: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const from = v;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, ms]);
  return v;
}

export function ScoreRing({ value, size = 180, label = "/ 100" }: { value: number; size?: number; label?: string }) {
  const shown = useCountUp(value);
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          style={{ filter: "drop-shadow(0 0 6px rgba(209,254,23,.45))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-black leading-none tabular-nums" style={{ fontSize: size * 0.3 }}>
            {shown}
          </div>
          <div className="text-xs text-mute">{label}</div>
        </div>
      </div>
    </div>
  );
}

const STEPS = ["Brief", "Analyze", "Improve", "Ready"];

export function Stepper({ current, onStep }: { current: number; onStep?: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1 text-sm sm:gap-2" aria-label="Progress">
      {STEPS.map((s, i) => {
        const done = i < current;
        const on = i === current;
        const can = !!onStep && done;
        return (
          <li key={s} className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              disabled={!can}
              onClick={() => can && onStep!(i)}
              aria-current={on ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${on ? "border-accent bg-accent/10 text-accent" : done ? "border-line text-white hover:border-white/40" : "border-transparent text-mute"}`}
            >
              <span className={`text-xs font-bold tabular-nums ${on ? "" : "opacity-60"}`}>{done ? "✓" : `0${i + 1}`}</span>
              <span className="font-semibold">{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`h-px w-4 sm:w-8 ${done ? "bg-accent/60" : "bg-line"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/** Renders any video reference: a finished generation, a local upload, or a sample clip. */
export function VideoThumb({ video, className = "", controls = false }: { video: VideoRef; className?: string; controls?: boolean }) {
  const { jobs } = useApp();
  const [broken, setBroken] = useState(false);
  if (video.source === "upload" && !broken)
    return <video src={video.url} muted loop autoPlay playsInline controls={controls} onError={() => setBroken(true)} className={`h-full w-full object-cover ${className}`} />;
  if (video.source === "asset") {
    const job = jobs.find((j) => j.id === video.jobId);
    if (job) return <Media item={jobMedia(job, video.seed)} controls={controls} className={className} />;
  }
  const fallback = video.source === "sample" ? byTopic(video.topic, video.i, "video") : byTopic("neon", 3, "video");
  return <Media item={fallback} controls={controls} className={className} />;
}
