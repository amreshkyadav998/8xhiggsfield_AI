"use client";
import Link from "next/link";
import { useState } from "react";
import { ago, health, scoresFor, baseline, type Analysis } from "@/lib/copilot";
import { useApp } from "@/lib/store";
import { VideoThumb, btnGhost, btnPrimary, tone } from "./ui";

const FLOW = [
  ["01", "Brief", "Tell Copilot what the video must achieve."],
  ["02", "Analyze", "Hook, pacing, product, CTA and brief fit, scored."],
  ["03", "Improve", "Apply fixes and pick a stronger hook."],
  ["04", "Ready", "Submit with a clean checklist."],
];

export default function Home({ list, ready, onClear }: { list: Analysis[]; ready: boolean; onClear: () => void }) {
  const { now } = useApp();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="cp-fade-up">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-[radial-gradient(ellipse_at_top_left,#1f2a00_0%,#0b0b0d_55%)] px-5 py-12 sm:px-10 md:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">✨ Creator Copilot</span>
        <h1 className="mt-5 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          Make every video <span className="text-accent">stronger</span> before you publish.
        </h1>
        <p className="mt-4 max-w-2xl text-mute md:text-lg">Analyze your content against your brief, get actionable feedback, and improve your creative before it goes live.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/creator-copilot?new=1" className={btnPrimary}>
            Analyze a Video →
          </Link>
          <a href="#recent" className={btnGhost}>
            View Previous Analyses
          </a>
        </div>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map(([n, t, d]) => (
            <li key={n} className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
              <div className="text-xs font-bold text-accent">{n}</div>
              <div className="mt-1 font-semibold">{t}</div>
              <div className="text-sm text-mute">{d}</div>
            </li>
          ))}
        </ol>
      </section>

      <section id="recent" className="mt-10 scroll-mt-24">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-accent sm:text-3xl">Recent analyses</h2>
          {list.length > 0 &&
            (confirm ? (
              <span className="flex items-center gap-2 text-sm">
                Clear all?
                <button onClick={() => (onClear(), setConfirm(false))} className="text-red-400 underline">
                  Yes
                </button>
                <button onClick={() => setConfirm(false)} className="text-mute underline">
                  No
                </button>
              </span>
            ) : (
              <button onClick={() => setConfirm(true)} className="text-sm text-mute hover:text-white">
                Clear history
              </button>
            ))}
        </div>

        {!ready ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer h-72 rounded-2xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
            <div className="text-4xl">✨</div>
            <h3 className="mt-3 text-xl font-bold">Your creative workspace is empty.</h3>
            <p className="mt-1 max-w-md text-mute">Analyze your first video and get actionable feedback before publishing.</p>
            <Link href="/creator-copilot?new=1" className={`${btnPrimary} mt-6`}>
              Analyze a Video
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((a) => {
              const score = health(scoresFor(a));
              const from = baseline(a);
              const improved = a.applied.length > 0 || !!a.hookId;
              return (
                <Link key={a.id} href={`/creator-copilot?id=${a.id}&step=${a.submittedAt ? "done" : "results"}`} className="group overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-white/30">
                  <div className="relative aspect-video overflow-hidden">
                    <VideoThumb video={a.video} className="transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className={`absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-black backdrop-blur ${tone(score)}`}>{score}</span>
                    {a.submittedAt && <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-black">Submitted</span>}
                    <span className="absolute bottom-3 left-4 right-4 truncate text-xs text-white/70">{a.video.name}</span>
                  </div>
                  <div className="p-4">
                    <div className="truncate font-semibold">{a.brief.brand}</div>
                    <div className="mt-0.5 text-sm text-mute">
                      Score {from !== score ? `${from} → ` : ""}
                      <span className={tone(score)}>{score}</span> · {improved ? "Improved" : "Analyzed"} {ago(a.updatedAt, now)}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-accent group-hover:underline">View analysis →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
