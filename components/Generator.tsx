"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EFFECTS, MODELS, RATIOS, estimate, type Kind, type Ratio } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import JobCard from "@/components/JobCard";

const chip = (on: boolean) =>
  `flex-1 rounded-md border py-1.5 text-xs ${on ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`;

const COPY: Record<Kind, { title: string; sub: string; placeholder: string }> = {
  image: { title: "Image", sub: "Stills from a prompt. Generate up to 4 at once.", placeholder: "Editorial portrait on a rooftop at golden hour, 35mm film grain…" },
  video: { title: "Video", sub: "Cinematic clips, priced per second.", placeholder: "A lone astronaut walking through a neon-lit market in the rain…" },
  audio: { title: "Audio", sub: "Voiceover from a script, or original music.", placeholder: "Warm, confident narrator: “Every frame tells a story…”" },
};

export default function Generator({ kind }: { kind: Kind }) {
  const { user, ready, jobs, generate } = useApp();
  const params = useSearchParams();
  const fx = EFFECTS.find((e) => e.id === params.get("effect") && e.kind === kind);
  const models = MODELS.filter((m) => m.kind === kind);
  const [modelId, setModelId] = useState(models.find((m) => m.id === params.get("model"))?.id ?? models[0].id);
  const [prompt, setPrompt] = useState(fx?.prompt ?? params.get("prompt") ?? "");
  const [ratio, setRatio] = useState<Ratio>(kind === "image" ? "4:5" : "16:9");
  const [seconds, setSeconds] = useState(5);
  const [count, setCount] = useState(kind === "image" ? 2 : 1);
  const [error, setError] = useState("");

  const model = MODELS.find((m) => m.id === modelId)!;
  const secs = kind === "video" ? seconds : 1;
  const n = kind === "image" ? count : 1;
  const cost = estimate(model, secs, n);
  const short = !!user && user.credits < cost;
  const mine = jobs.filter((j) => j.kind === kind);

  const pickModel = (id: string) => {
    setModelId(id);
    const m = MODELS.find((x) => x.id === id)!;
    if (m.durations && !m.durations.includes(seconds)) setSeconds(m.durations[0]);
  };
  const submit = () => {
    const r = generate({
      kind,
      modelId,
      prompt: prompt.trim(),
      ratio: kind === "audio" ? "16:9" : ratio,
      seconds: secs,
      count: n,
      hue: fx && fx.prompt === prompt ? fx.hue : undefined,
    });
    setError(r.ok ? "" : (r.error ?? ""));
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[380px_1fr]">
      <section className="h-fit space-y-5 rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-20">
        <div>
          <h1 className="text-xl font-bold">{COPY[kind].title}</h1>
          <p className="text-xs text-mute">{COPY[kind].sub}</p>
        </div>

        <label className="block">
          <span className="mb-1.5 flex justify-between text-xs text-mute">
            {kind === "audio" ? "Script or description" : "Prompt"} {fx && <span className="text-accent">from “{fx.name}”</span>}
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder={COPY[kind].placeholder}
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

        {kind !== "audio" && (
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
        )}

        {kind === "video" && (
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
        )}
        {kind === "image" && (
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

        <GenerateButton ready={ready} signedIn={!!user} cost={cost} disabled={!prompt.trim() || short} onClick={submit} next={`/${kind}`} />
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-mute">{mine.length ? `Recent ${kind} (${mine.length})` : `Recent ${kind}`}</h2>
          <Link href="/assets" className="text-xs text-mute hover:text-white">
            All assets →
          </Link>
        </div>
        {mine.length === 0 ? (
          <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-line px-6 text-center text-sm text-mute">
            <div>
              Nothing yet. Write a prompt, or start from a look on{" "}
              <Link href="/" className="text-accent underline">
                Explore
              </Link>
              .
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mine.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function GenerateButton({
  ready,
  signedIn,
  cost,
  disabled,
  onClick,
  next,
  label = "Generate",
}: {
  ready: boolean;
  signedIn: boolean;
  cost: number;
  disabled: boolean;
  onClick: () => void;
  next: string;
  label?: string;
}) {
  if (ready && !signedIn)
    return (
      <Link href={`/login?next=${next}`} className="block rounded-xl bg-accent py-3 text-center font-semibold text-black">
        Sign in to {label.toLowerCase()} · {cost} credits
      </Link>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-accent py-3 font-semibold text-black enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label} · {cost} credits
    </button>
  );
}
