"use client";
import { useEffect, useState } from "react";
import { CATEGORIES, type CategoryId } from "@/lib/creatorCopilotMockData";
import { fill, health, issues, scoresFor, template, type Analysis } from "@/lib/copilot";
import { Portal, ScoreRing, VideoThumb, bar, btnGhost, btnPrimary, tone, useCountUp } from "./ui";

function verdict(n: number) {
  if (n >= 90) return "Excellent. Ready to publish.";
  if (n >= 80) return "Good, with a few clear wins left.";
  if (n >= 70) return "Promising, but needs work before publishing.";
  return "Needs significant changes.";
}

function CategoryCard({ label, value, base, onWhy, i }: { label: string; value: number; base: number; onWhy: () => void; i: number }) {
  const shown = useCountUp(value, 700 + i * 120);
  return (
    <button onClick={onWhy} className="group rounded-2xl border border-line bg-panel p-4 text-left transition-colors hover:border-white/30 focus-visible:border-accent" style={{ animationDelay: `${i * 60}ms` }}>
      <div className="flex items-start justify-between">
        <span className="text-sm text-mute">{label}</span>
        <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-mute transition-colors group-hover:border-accent group-hover:text-accent">Why?</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-4xl font-black tabular-nums ${tone(value)}`}>{shown}</span>
        {base !== value && <span className="text-sm text-mute">from {base}</span>}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-[width] duration-700 ${bar(value)}`} style={{ width: `${shown}%` }} />
      </div>
    </button>
  );
}

export function WhyPanel({ a, id, onClose, onFix }: { a: Analysis; id: CategoryId; onClose: () => void; onFix: (fixId: string) => void }) {
  const t = template(a);
  const s = scoresFor(a);
  const e = t.why[id];
  const label = CATEGORIES.find((c) => c.id === id)!.label;
  const fixed = e.fixId && a.applied.includes(e.fixId);
  useEffect(() => {
    const k = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <Portal>
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal aria-label={`Why ${label} scored ${s[id]}`}>
      <aside className="cp-slide-in h-full w-full max-w-md overflow-y-auto border-l border-line bg-[#0f0f12] p-6" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mute">{label}</span>
          <button onClick={onClose} className="rounded-lg border border-line px-3 py-1 text-sm hover:border-white" aria-label="Close">
            ✕
          </button>
        </div>
        <h3 className="mt-4 text-4xl font-black uppercase tracking-tight">
          Why <span className={tone(s[id])}>{s[id]}</span>?
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-white/90">“{fill(e.why, a.brief)}”</p>
        <div className="mt-6 text-xs font-bold uppercase tracking-widest text-mute">What we saw</div>
        <ul className="mt-2 space-y-2">
          {e.evidence.map((x) => (
            <li key={x} className="flex gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-accent">●</span> {fill(x, a.brief)}
            </li>
          ))}
        </ul>
        {e.recommend && (
          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-accent">Recommended</div>
            <div className="mt-1 font-semibold">{e.recommend.label}</div>
            {e.recommend.from && (
              <div className="mt-2 flex items-center gap-3 text-lg font-bold">
                <span className="text-mute line-through decoration-orange-400">{e.recommend.from}</span>→<span className="text-accent">{e.recommend.to}</span>
              </div>
            )}
          </div>
        )}
        {e.fixId &&
          (fixed ? (
            <p className="mt-5 text-sm text-accent">✓ Recommendation applied</p>
          ) : (
            <button onClick={() => onFix(e.fixId!)} className={`${btnPrimary} mt-5 w-full`}>
              Fix this →
            </button>
          ))}
        {id === "hook" && !a.hookId && (
          <button onClick={() => onFix("hook")} className={`${btnGhost} mt-3 w-full`}>
            ✨ Improve my hook
          </button>
        )}
      </aside>
    </div>
    </Portal>
  );
}

export default function Results({ a, onFix, onContinue }: { a: Analysis; onFix: (fixId?: string) => void; onContinue: () => void }) {
  const [why, setWhy] = useState<CategoryId | null>(null);
  const t = template(a);
  const s = scoresFor(a);
  const score = health(s);
  const { critical } = issues(a);
  const improvements = [
    ...t.fixes.map((f) => ({ kind: "fix" as const, f })),
    { kind: "keep" as const, f: null },
  ];

  return (
    <div className="cp-fade-up space-y-5">
      <section className="grid gap-5 rounded-3xl border border-line bg-[radial-gradient(ellipse_at_top_right,#1f2a00_0%,#0f0f12_60%)] p-5 sm:p-7 lg:grid-cols-[260px_1fr_auto] lg:items-center">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-2xl bg-black">
          <VideoThumb video={a.video} />
          <span className="absolute bottom-2 left-2 right-2 truncate rounded-lg bg-black/60 px-2 py-1 text-xs backdrop-blur">{a.video.name}</span>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-accent">Content health</div>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">{verdict(score)}</h2>
          <p className="mt-2 text-mute">
            {a.brief.brand} · {a.brief.platform} · {a.brief.goal}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-line px-3 py-1">Audience: {a.brief.audience}</span>
            <span className="rounded-full border border-line px-3 py-1">Tone: {a.brief.tone}</span>
            <span className={`rounded-full px-3 py-1 ${critical ? "bg-orange-400/15 text-orange-300" : "bg-accent/15 text-accent"}`}>
              {critical ? `${critical} critical issue${critical > 1 ? "s" : ""}` : "No critical issues"}
            </span>
          </div>
        </div>
        <div className="mx-auto">
          <ScoreRing value={score} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-lg font-bold">Scores</h3>
          <span className="text-xs text-mute">Tap any score to see why</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.id} i={i} label={c.label} value={s[c.id]} base={t.scores[c.id]} onWhy={() => setWhy(c.id)} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <h3 className="text-lg font-bold">{improvements.length} things to look at</h3>
        <ul className="mt-4 divide-y divide-line">
          {improvements.map(({ kind, f }) =>
            kind === "fix" && f ? (
              <li key={f.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${a.applied.includes(f.id) ? "bg-accent text-black" : "bg-orange-400/15 text-orange-300"}`}>
                  {a.applied.includes(f.id) ? "✓" : "⚠"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-mute">{f.detail}</div>
                  <div className="mt-1 text-sm">
                    <span className="text-mute">Recommended: </span>
                    {f.recommended}
                  </div>
                </div>
                {a.applied.includes(f.id) ? (
                  <span className="text-sm text-accent">Applied</span>
                ) : (
                  <button onClick={() => onFix(f.id)} className={`${btnPrimary} px-4 py-2`}>
                    Fix
                  </button>
                )}
              </li>
            ) : (
              <li key="keep" className="flex items-center gap-4 py-4 last:pb-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">✓</span>
                <div className="flex-1">
                  <div className="font-semibold">{t.keep.title}</div>
                  <div className="text-sm text-mute">{t.keep.detail}</div>
                </div>
              </li>
            )
          )}
        </ul>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button onClick={() => onFix("hook")} className={btnGhost}>
          ✨ Improve my hook
        </button>
        <button onClick={onContinue} className={btnPrimary}>
          {critical ? "Start improving →" : "Continue to Ready →"}
        </button>
      </div>

      {why && <WhyPanel a={a} id={why} onClose={() => setWhy(null)} onFix={(id) => (setWhy(null), onFix(id))} />}
    </div>
  );
}
