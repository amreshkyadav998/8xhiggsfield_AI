"use client";
// Creator Copilot logic: scoring, the analysis "service", and persisted history.
// analyzeVideo() is the only place that would call a real model; everything else is pure.
import { useCallback, useEffect, useState } from "react";
import {
  CATEGORIES,
  EXAMPLE_BRIEFS,
  PLATFORM_RATIO,
  SEED_HISTORY,
  TEMPLATES,
  type AnalysisTemplate,
  type Beat,
  type Brief,
  type CategoryId,
} from "./creatorCopilotMockData";

export type VideoRef =
  | { source: "asset"; jobId: string; seed: number; name: string; ratio?: string }
  | { source: "upload"; url: string; name: string; secs?: number }
  | { source: "sample"; topic: string; i: number; name: string };

export interface Analysis {
  id: string;
  brief: Brief;
  templateId: string;
  video: VideoRef;
  createdAt: number;
  updatedAt: number;
  applied: string[]; // fix ids
  hookId?: string;
  submittedAt?: number;
}

export const template = (a: Analysis): AnalysisTemplate => TEMPLATES[a.templateId] ?? TEMPLATES.coding;

/** Replaces {brand}-style tokens with the brief's values. */
export const fill = (text: string, b: Brief) =>
  text.replace(/\{(brand|audience|platform|message)\}/g, (_, k: keyof Brief) => b[k]);

export function scoresFor(a: Analysis): Record<CategoryId, number> {
  const t = template(a);
  const s = { ...t.scores };
  for (const f of t.fixes) if (a.applied.includes(f.id)) Object.assign(s, f.effects);
  const hook = t.hooks.find((h) => h.id === a.hookId);
  if (hook) Object.assign(s, hook.effects);
  return s;
}

export const health = (s: Record<CategoryId, number>) => Math.round(CATEGORIES.reduce((n, c) => n + s[c.id] * c.weight, 0));
export const baseline = (a: Analysis) => health(template(a).scores);

export function timelineFor(a: Analysis, applied = a.applied): Beat[] {
  const key = [...applied].sort().join("+");
  return template(a).timelines[key] ?? template(a).timelines[""];
}

export function issues(a: Analysis) {
  const t = template(a);
  const s = scoresFor(a);
  const open = t.fixes.filter((f) => !a.applied.includes(f.id));
  const critical = open.filter((f) => f.severity === "critical").length + (s.hook < 85 ? 1 : 0);
  const optional = open.filter((f) => f.severity === "optional").length + (s.authenticity < 85 ? 1 : 0) + (a.hookId ? 0 : 1);
  return { critical, optional };
}

export function checklist(a: Analysis) {
  const s = scoresFor(a);
  const want = PLATFORM_RATIO[a.brief.platform];
  const have = a.video.source === "asset" ? a.video.ratio : undefined;
  return [
    { label: "Product clearly demonstrated", ok: s.product >= 90 && s.pacing >= 90 },
    { label: "Brief requirements satisfied", ok: s.brief >= 90 },
    { label: "Strong opening hook", ok: s.hook >= 90 },
    { label: "CTA detected", ok: s.cta >= 80 },
    { label: have && want && have !== want ? `Format ${have}, ${a.brief.platform} expects ${want}` : "Correct format", ok: !have || !want || have === want },
    { label: "No critical issues", ok: issues(a).critical === 0 },
  ];
}

/** Picks the closest template for a brief. A real implementation would send the video + brief to a model. */
function templateFor(b: Brief) {
  const text = `${b.brand} ${b.message}`.toLowerCase();
  if (/(fit|workout|gym|train|health)/.test(text)) return "fitness";
  return "coding";
}

/** Mock analysis service: resolves after the UI's analysis sequence, with deterministic results. */
export function analyzeVideo(brief: Brief, video: VideoRef, ms = 4200): Promise<Analysis> {
  return new Promise((res) =>
    setTimeout(() => {
      const t = Date.now();
      res({ id: `cp_${t.toString(36)}`, brief, video, templateId: templateFor(brief), createdAt: t, updatedAt: t, applied: [] });
    }, ms)
  );
}

export function ago(t: number, now = Date.now()) {
  const m = Math.round((now - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

const KEY = "hf.copilot";
const SEEDED = "hf.copilot.seeded";

function seed(): Analysis[] {
  const now = Date.now();
  return SEED_HISTORY.map((s, i) => {
    const ex = EXAMPLE_BRIEFS.find((e) => e.id === s.exampleId)!;
    const at = now - s.hoursAgo * 3600e3;
    return {
      id: `cp_demo_${i}`,
      brief: ex.brief,
      templateId: ex.template,
      video: { source: "sample", topic: s.video.topic, i: s.video.i, name: s.video.name },
      createdAt: at - 20 * 60e3,
      updatedAt: at,
      applied: s.applied,
      hookId: s.hookId,
    };
  });
}

/** Analyses persisted in this browser; seeded once with demo history. */
export function useCopilotHistory() {
  const [list, setList] = useState<Analysis[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let l: Analysis[] = [];
    try {
      l = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!localStorage.getItem(SEEDED)) {
        l = [...l, ...seed()];
        // Persist right away: in dev, effects run twice and the second run must see the seeded list.
        localStorage.setItem(KEY, JSON.stringify(l));
        localStorage.setItem(SEEDED, "1");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(l);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  }, [list, ready]);

  const save = useCallback((a: Analysis) => setList((l) => [{ ...a, updatedAt: Date.now() }, ...l.filter((x) => x.id !== a.id)]), []);
  const remove = useCallback((id: string) => setList((l) => l.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setList([]), []);
  return { list, ready, save, remove, clear };
}
