"use client";
import Link from "next/link";
import { baseline, checklist, health, issues, scoresFor, type Analysis } from "@/lib/copilot";
import { ScoreRing, VideoThumb, btnGhost, btnPrimary, tone, useCountUp } from "./ui";

export default function Ready({ a, onSubmit, onBack }: { a: Analysis; onSubmit: () => void; onBack: () => void }) {
  const s = scoresFor(a);
  const score = health(s);
  const from = baseline(a);
  const shown = useCountUp(score);
  const { critical, optional } = issues(a);
  const checks = checklist(a);
  const ready = critical === 0;

  return (
    <div className="cp-fade-up grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-black">
        <div className="aspect-[4/5] lg:aspect-auto lg:h-full">
          <VideoThumb video={a.video} />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5">
          <div className="text-sm text-white/70">{a.video.name}</div>
          <div className="font-semibold">
            {a.brief.brand} · {a.brief.platform}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-panel p-5 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-widest text-accent">04 · Ready</div>
        <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl">{ready ? "Ready to submit" : "Almost ready"}</h2>
        {!ready && <p className="mt-2 text-mute">Fix the critical issue{critical > 1 ? "s" : ""} below for the best result, or submit as is.</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-4 rounded-2xl bg-black/30 p-4 sm:col-span-2">
            <ScoreRing value={score} size={96} />
            <div>
              <div className="text-sm text-mute">Content health</div>
              <div className="text-3xl font-black tabular-nums">
                <span className="text-mute">{from}</span> → <span className={tone(score)}>{shown}</span>
              </div>
              {score > from && <div className="text-sm text-accent">+{score - from} points from your edits</div>}
            </div>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <div className="text-sm text-mute">Brief alignment</div>
            <div className={`text-3xl font-black ${tone(s.brief)}`}>{s.brief}%</div>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <div className="text-sm text-mute">Issues</div>
            <div className="mt-1 text-sm">
              <span className={critical ? "font-bold text-orange-300" : "font-bold text-accent"}>{critical} critical</span>
              <br />
              <span className="text-mute">{optional} optional</span>
            </div>
          </div>
        </div>

        <ul className="mt-6 space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-3">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${c.ok ? "bg-accent text-black" : "bg-orange-400/20 text-orange-300"}`}>{c.ok ? "✓" : "!"}</span>
              <span className={c.ok ? "" : "text-orange-200"}>{c.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={onSubmit} className={`${btnPrimary} flex-1 py-4 text-lg`}>
            Submit
          </button>
          <button onClick={onBack} className={btnGhost}>
            ← Keep improving
          </button>
        </div>
      </section>
    </div>
  );
}

export function Done({ a }: { a: Analysis }) {
  const score = health(scoresFor(a));
  return (
    <div className="cp-fade-up mx-auto max-w-2xl rounded-3xl border border-accent/30 bg-[radial-gradient(ellipse_at_top,#1f2a00_0%,#0f0f12_70%)] px-6 py-14 text-center">
      <div className="cp-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent text-4xl text-black shadow-[0_0_60px_rgba(209,254,23,.5)]">✓</div>
      <h2 className="mt-6 text-4xl font-black uppercase tracking-tight">Your video is ready.</h2>
      <p className="mt-2 text-mute">
        {a.brief.brand} for {a.brief.platform} · content health <span className={tone(score)}>{score}</span>
      </p>
      <p className="mt-1 text-sm text-mute">Saved to your Copilot history{a.submittedAt ? ` · submitted ${new Date(a.submittedAt).toLocaleString()}` : ""}.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/creator-copilot?new=1" className={btnPrimary}>
          Analyze another video
        </Link>
        <Link href="/creator-copilot" className={btnGhost}>
          Back to Copilot
        </Link>
        <Link href="/assets" className={btnGhost}>
          Open Assets
        </Link>
      </div>
    </div>
  );
}
