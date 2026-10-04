"use client";
import { useEffect, useRef, useState } from "react";
import type { Beat } from "@/lib/creatorCopilotMockData";
import { baseline, health, scoresFor, template, timelineFor, type Analysis } from "@/lib/copilot";
import { Portal, ScoreRing, btnGhost, btnPrimary, tone, useCountUp } from "./ui";

const COLORS: Record<Beat["kind"], string> = {
  hook: "bg-accent text-black",
  talk: "bg-white/15 text-white/70",
  benefit: "bg-sky-400/80 text-black",
  demo: "bg-fuchsia-400/90 text-black",
  proof: "bg-amber-300 text-black",
  cta: "bg-emerald-400 text-black",
};

function Timeline({ beats, total, label, highlight }: { beats: Beat[]; total: number; label: string; highlight?: string }) {
  const end = beats[beats.length - 1].end;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-widest text-mute">{label}</span>
        <span className="tabular-nums text-mute">{end.toFixed(1)}s</span>
      </div>
      {/* Desktop: proportional strip */}
      <div className="hidden h-14 gap-1 sm:flex" style={{ width: `${(end / total) * 100}%` }}>
        {beats.map((b) => (
          <div
            key={b.label + b.start}
            title={`${b.label} ${b.start}s–${b.end}s`}
            className={`relative flex min-w-0 flex-col justify-center overflow-hidden rounded-lg px-2 transition-all duration-500 ${COLORS[b.kind]} ${highlight && b.kind === highlight ? "ring-2 ring-white" : ""}`}
            style={{ flex: b.end - b.start }}
          >
            <span className="truncate text-xs font-bold">{b.label}</span>
            <span className="text-[10px] tabular-nums opacity-70">{b.start}s</span>
          </div>
        ))}
      </div>
      {/* Phones: vertical sequence */}
      <ol className="space-y-1 sm:hidden">
        {beats.map((b) => (
          <li key={b.label + b.start} className="flex items-center gap-3">
            <span className="w-10 text-right text-xs tabular-nums text-mute">{b.start}s</span>
            <span className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold ${COLORS[b.kind]}`}>{b.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Improve({ a, focus, onChange, onContinue }: { a: Analysis; focus?: string; onChange: (a: Analysis) => void; onContinue: () => void }) {
  const t = template(a);
  const s = scoresFor(a);
  const score = health(s);
  const from = baseline(a);
  const shownFrom = useCountUp(from);
  const [toast, setToast] = useState("");
  const hookRef = useRef<HTMLElement>(null);
  const allFixes = t.fixes.map((f) => f.id);
  const allApplied = allFixes.every((id) => a.applied.includes(id));
  const best = [...t.hooks].sort((x, y) => y.score - x.score)[0];
  const potential = health(scoresFor({ ...a, applied: allFixes, hookId: best.id }));

  useEffect(() => {
    if (focus === "hook") hookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const toggle = (id: string) => {
    const on = a.applied.includes(id);
    onChange({ ...a, applied: on ? a.applied.filter((x) => x !== id) : [...a.applied, id] });
    setToast(on ? "Recommendation undone" : "✓ Recommendation applied");
  };
  const pickHook = (id: string) => {
    onChange({ ...a, hookId: id });
    setToast("✓ Hook updated");
  };
  const currentHook = t.hooks.find((h) => h.id === a.hookId);

  return (
    <div className="cp-fade-up space-y-5">
      <section className="flex flex-wrap items-center gap-5 rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <ScoreRing value={score} size={110} />
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">03 · Improve</div>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight sm:text-3xl">
            {score === from ? (
              <>
                Health {shownFrom} <span className="text-mute">· up to</span> <span className="text-accent">{potential}</span>
              </>
            ) : (
              <>
                Health <span className="text-mute">{shownFrom}</span> → <span className={tone(score)}>{score}</span>
              </>
            )}
          </h2>
          <p className="text-sm text-mute">Every change updates the score live. Edits are previews; your original file is untouched.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <h3 className="text-lg font-bold">Structure</h3>
        <p className="text-sm text-mute">Original vs recommended edit of your {t.duration}s video.</p>
        <div className="mt-5 space-y-5">
          <Timeline beats={timelineFor(a, [])} total={t.duration} label="Original" />
          <Timeline beats={timelineFor(a, allFixes)} total={t.duration} label={allApplied ? "Your edit · all fixes applied" : "Recommended"} highlight="demo" />
          {!allApplied && a.applied.length > 0 && <Timeline beats={timelineFor(a)} total={t.duration} label="Your edit so far" />}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {t.fixes.map((f) => {
            const on = a.applied.includes(f.id);
            return (
              <div key={f.id} className={`rounded-2xl border p-4 transition-colors ${on ? "border-accent/50 bg-accent/5" : focus === f.id ? "border-white/40" : "border-line"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-mute">{f.recommended}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${f.severity === "critical" ? "bg-orange-400/15 text-orange-300" : "bg-white/10 text-mute"}`}>{f.severity}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-lg font-bold">
                  <span className={on ? "text-mute line-through" : ""}>{f.change.from}</span>→<span className="text-accent">{f.change.to}</span>
                </div>
                <button onClick={() => toggle(f.id)} className={`${on ? btnGhost : btnPrimary} mt-4 w-full py-2.5`}>
                  {on ? "✓ Applied · Undo" : "Apply Recommendation"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section ref={hookRef} className="scroll-mt-24 rounded-3xl border border-line bg-panel p-5 sm:p-6">
        <h3 className="text-lg font-bold">✨ Improve my hook</h3>
        <div className="mt-4 rounded-2xl bg-black/30 p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-mute">{currentHook ? "Original" : "Current"}</div>
          <p className={`mt-1 text-lg ${currentHook ? "text-mute line-through" : ""}`}>“{t.currentHook}”</p>
          {currentHook && (
            <>
              <div className="mt-3 text-xs font-bold uppercase tracking-widest text-accent">Now</div>
              <p className="mt-1 text-lg font-semibold">“{currentHook.text}”</p>
            </>
          )}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {t.hooks.map((h, i) => {
            const on = a.hookId === h.id;
            return (
              <div key={h.id} className={`flex flex-col rounded-2xl border p-4 transition-colors ${on ? "border-accent bg-accent/5" : "border-line hover:border-white/30"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-mute">Option {i + 1}</span>
                  <span className={`text-2xl font-black tabular-nums ${tone(h.score)}`}>{h.score}</span>
                </div>
                <p className="mt-2 text-lg font-semibold leading-snug">“{h.text}”</p>
                <p className="mt-2 flex-1 text-sm text-mute">
                  <span className="text-white/80">Why it works: </span>
                  {h.why}
                </p>
                <button onClick={() => pickHook(h.id)} disabled={on} className={`${on ? btnGhost : btnPrimary} mt-4 w-full py-2.5`}>
                  {on ? "✓ Selected" : "Use this hook"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={onContinue} className={btnPrimary}>
          Continue to Ready →
        </button>
      </div>

      {toast && (
        <Portal>
          <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
            <div className="cp-pop rounded-full border border-accent/60 bg-[#141417] px-5 py-2.5 font-semibold text-accent shadow-[0_10px_40px_rgba(0,0,0,.6)]">{toast}</div>
          </div>
        </Portal>
      )}
    </div>
  );
}
