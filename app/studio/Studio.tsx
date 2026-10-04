"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EFFECTS, MODELS, RATIOS, estimate, type Kind, type Ratio } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import JobCard from "@/components/JobCard";

const chip = (on: boolean) =>
  `flex-1 rounded-md border py-1.5 text-xs ${on ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`;

export default function Studio() {
  const { user, ready, jobs, generate } = useApp();
  const effectId = useSearchParams().get("effect");
  const fx = EFFECTS.find((e) => e.id === effectId);
  const [kind, setKind] = useState<Kind>(fx?.kind ?? "image");
  const [modelId, setModelId] = useState(fx ? MODELS.find((m) => m.kind === fx.kind)!.id : "soul");
  const [prompt, setPrompt] = useState(fx?.prompt ?? "");
  const [ratio, setRatio] = useState<Ratio>("16:9");
  const [seconds, setSeconds] = useState(5);
  const [count, setCount] = useState(2);
  const [error, setError] = useState("");

  const models = MODELS.filter((m) => m.kind === kind);
  const model = MODELS.find((m) => m.id === modelId)!;
  const secs = kind === "video" ? seconds : 1;
  const n = kind === "video" ? 1 : count;
  const cost = estimate(model, secs, n);
  const short = !!user && user.credits < cost;

  const fixDuration = (id: string) => {
    const m = MODELS.find((x) => x.id === id)!;
    if (m.durations && !m.durations.includes(seconds)) setSeconds(m.durations[0]);
  };
  const pickKind = (k: Kind) => {
    setKind(k);
    const id = MODELS.find((x) => x.kind === k)!.id;
    setModelId(id);
    fixDuration(id);
  };
  const pickModel = (id: string) => {
    setModelId(id);
    fixDuration(id);
  };
  const submit = () => {
    const r = generate({
      kind,
      modelId,
      prompt: prompt.trim(),
      ratio,
      seconds: secs,
      count: n,
      hue: fx && fx.prompt === prompt ? fx.hue : undefined,
    });
    setError(r.ok ? "" : (r.error ?? ""));
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[380px_1fr]">
      <section className="h-fit space-y-5 rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-20">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/40 p-1 text-sm" role="tablist">
          {(["image", "video"] as Kind[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              onClick={() => pickKind(k)}
              className={`rounded-md py-2 capitalize ${kind === k ? "bg-white font-semibold text-black" : "text-mute hover:text-white"}`}
            >
              {k}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 flex justify-between text-xs text-mute">
            Prompt {fx && <span className="text-accent">from “{fx.name}”</span>}
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="A lone astronaut walking through a neon-lit market in the rain…"
            className="w-full resize-none rounded-lg border border-line bg-black/40 p-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-xs text-mute">Model</span>
          <div className="space-y-1.5">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => pickModel(m.id)}
                className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm ${modelId === m.id ? "border-accent bg-accent/5" : "border-line hover:border-mute"}`}
              >
                <span>
                  <span className="font-medium">{m.name}</span>
                  <span className="block text-xs text-mute">{m.blurb}</span>
                </span>
                <span className="text-xs text-mute">
                  {m.cost}cr{m.kind === "video" ? "/s" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-mute">Aspect ratio</span>
          <div className="flex gap-1.5">
            {RATIOS.map((r) => (
              <button key={r} onClick={() => setRatio(r)} className={chip(ratio === r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {kind === "video" ? (
          <div>
            <span className="mb-1.5 block text-xs text-mute">Duration</span>
            <div className="flex gap-1.5">
              {model.durations!.map((d) => (
                <button key={d} onClick={() => setSeconds(d)} className={chip(seconds === d)}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <span className="mb-1.5 block text-xs text-mute">Images</span>
            <div className="flex gap-1.5">
              {[1, 2, 4].map((c) => (
                <button key={c} onClick={() => setCount(c)} className={chip(count === c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {ready && !user ? (
          <Link href="/login?next=/studio" className="block rounded-xl bg-accent py-3 text-center font-semibold text-black">
            Sign in to generate · {cost} credits
          </Link>
        ) : (
          <button
            onClick={submit}
            disabled={!prompt.trim() || short}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-black enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate · {cost} credits
          </button>
        )}
        {short && (
          <p className="text-xs text-red-400">
            You have {user!.credits} credits.{" "}
            <Link href="/pricing" className="underline">
              Get more
            </Link>
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium text-mute">{jobs.length ? `Your generations (${jobs.length})` : "Your generations"}</h2>
        {jobs.length === 0 ? (
          <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-line text-center text-sm text-mute">
            <div>
              Nothing yet. Write a prompt, or start from an{" "}
              <Link href="/effects" className="text-accent underline">
                effect
              </Link>
              .
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
