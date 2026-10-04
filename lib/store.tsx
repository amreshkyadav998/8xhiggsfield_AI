"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MODELS, fmt, price, type Kind, type Quality, type Ratio, type Res } from "./catalog";
import { seedsFor } from "./media";

export interface User {
  email: string;
  name: string;
  plan: string;
  credits: number;
}
export interface Job {
  id: string;
  kind: Kind;
  modelId: string;
  prompt: string;
  ratio: Ratio;
  seconds: number; // video length, 1 for image
  count: number;
  cost: number;
  startedAt: number;
  durationMs: number;
  seeds: number[];
  hue?: number;
  style?: string; // Genjutsu look
  source?: string; // uploaded clip (blob URL, lives until reload)
  canceled?: boolean;
  quality?: Quality;
  res?: Res;
  refs?: number; // reference images attached
  tool?: string; // which tab made it, e.g. "Motion Control"
  topic?: string; // forces the media library topic (presets, motions)
  voice?: string; // VOICES id for speech and voice change
  rate?: number; // speed multiplier on top of the voice default
  units?: number; // billing units when they differ from output count (TTS length)
}
/** Per-output flags, keyed by `${jobId}:${seed}`. */
export type Marks = Record<string, { liked?: boolean; downloaded?: boolean }>;
export const markKey = (j: Job, seed: number) => `${j.id}:${seed}`;
export type JobStatus = "queued" | "rendering" | "done" | "canceled";

export const jobStatus = (j: Job, now: number): { status: JobStatus; progress: number } => {
  if (j.canceled) return { status: "canceled", progress: 0 };
  const t = now - j.startedAt;
  if (t < 900) return { status: "queued", progress: 0 };
  if (t >= j.durationMs) return { status: "done", progress: 1 };
  return { status: "rendering", progress: (t - 900) / (j.durationMs - 900) };
};

interface Ctx {
  ready: boolean;
  user: User | null;
  jobs: Job[];
  now: number;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  generate: (p: Omit<Job, "id" | "cost" | "startedAt" | "durationMs" | "seeds">) => { ok: boolean; error?: string };
  cancel: (id: string) => void;
  remove: (id: string) => void;
  setPlan: (plan: string, credits: number) => void;
  topUp: (n: number) => void;
  marks: Marks;
  toggleLike: (key: string) => void;
  markDownloaded: (key: string) => void;
}
const C = createContext<Ctx>(null as never);
export const useApp = () => useContext(C);

const K = { user: "hf.user", jobs: "hf.jobs", marks: "hf.marks" };
const read = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [marks, setMarks] = useState<Marks>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(read<User | null>(K.user, null));
    setJobs(read<Job[]>(K.jobs, []));
    setMarks(read<Marks>(K.marks, {}));
    setReady(true);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (ready) write(K.user, user);
  }, [user, ready]);
  useEffect(() => {
    if (ready) write(K.jobs, jobs);
  }, [jobs, ready]);
  useEffect(() => {
    if (ready) write(K.marks, marks);
  }, [marks, ready]);

  const signIn = useCallback((email: string, name?: string) => {
    const accounts = read<Record<string, User>>("hf.accounts", {});
    const existing = accounts[email.toLowerCase()];
    const u = existing ?? { email: email.toLowerCase(), name: name || email.split("@")[0], plan: "free", credits: 50 };
    setUser(u);
  }, []);
  const signOut = useCallback(() => {
    setUser((u) => {
      if (u) write("hf.accounts", { ...read<Record<string, User>>("hf.accounts", {}), [u.email]: u });
      return null;
    });
  }, []);

  const generate: Ctx["generate"] = useCallback(
    (p) => {
      if (!user) return { ok: false, error: "Sign in to generate" };
      const m = MODELS.find((x) => x.id === p.modelId)!;
      const cost = price(m, { ...p, count: p.units ?? p.count }).charge;
      if (!p.prompt.trim()) return { ok: false, error: "Describe what you want to see" };
      if (user.credits < cost) return { ok: false, error: `Needs ${fmt(cost)} credits, you have ${fmt(user.credits)}` };
      const t = Date.now();
      const job: Job = {
        ...p,
        id: `${t}-${Math.floor(Math.random() * 1e4)}`,
        cost,
        startedAt: t,
        durationMs: m.seconds * 1000 * (m.kind === "video" ? p.seconds / 5 : 1) * 0.6 + 1500,
        seeds: seedsFor(p.count),
      };
      setUser({ ...user, credits: user.credits - cost });
      setJobs((j) => [job, ...j]);
      return { ok: true };
    },
    [user]
  );
  const cancel = useCallback(
    (id: string) => {
      const j = jobs.find((x) => x.id === id);
      if (!j || jobStatus(j, Date.now()).status === "done" || j.canceled) return;
      setJobs((all) => all.map((x) => (x.id === id ? { ...x, canceled: true } : x)));
      setUser((u) => (u ? { ...u, credits: u.credits + j.cost } : u)); // refund
    },
    [jobs]
  );
  const remove = useCallback((id: string) => setJobs((all) => all.filter((x) => x.id !== id)), []);
  const setPlan = useCallback((plan: string, credits: number) => setUser((u) => (u ? { ...u, plan, credits: u.credits + credits } : u)), []);
  const topUp = useCallback((n: number) => setUser((u) => (u ? { ...u, credits: u.credits + n } : u)), []);
  const toggleLike = useCallback((k: string) => setMarks((m) => ({ ...m, [k]: { ...m[k], liked: !m[k]?.liked } })), []);
  const markDownloaded = useCallback((k: string) => setMarks((m) => ({ ...m, [k]: { ...m[k], downloaded: true } })), []);

  const value = useMemo(
    () => ({ ready, user, jobs, now, signIn, signOut, generate, cancel, remove, setPlan, topUp, marks, toggleLike, markDownloaded }),
    [ready, user, jobs, now, signIn, signOut, generate, cancel, remove, setPlan, topUp, marks, toggleLike, markDownloaded]
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
