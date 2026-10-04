"use client";
import { useState } from "react";
import { INFLUENCER_STYLES } from "@/lib/catalog";
import { PromptMedia } from "@/components/Media";
import { useApp } from "@/lib/store";
import JobCard from "@/components/JobCard";
import { GenerateButton } from "@/components/Generator";

const LOOKS = ["Freckles", "Short hair", "Long curls", "Glasses", "Tattoos", "Buzz cut"];
const COST = 4; // 4 portraits on Nano Pro at 1 credit each

export default function Influencer() {
  const { user, ready, jobs, generate } = useApp();
  const [name, setName] = useState("");
  const [style, setStyle] = useState(INFLUENCER_STYLES[0]);
  const [looks, setLooks] = useState<string[]>([]);
  const [vibe, setVibe] = useState("");
  const [error, setError] = useState("");
  const mine = jobs.filter((j) => j.prompt.startsWith("AI influencer"));

  const toggle = (l: string) => setLooks((x) => (x.includes(l) ? x.filter((y) => y !== l) : [...x, l]));
  const submit = () => {
    const prompt = `AI influencer ${name.trim() || "Nova"}, ${style.toLowerCase()} fashion portrait${looks.length ? ", " + looks.join(", ").toLowerCase() : ""}${vibe.trim() ? ", " + vibe.trim() : ""}`;
    const r = generate({ kind: "image", modelId: "nano", prompt, ratio: "4:5", seconds: 1, count: 4, hue: INFLUENCER_STYLES.indexOf(style) * 50 });
    setError(r.ok ? "" : (r.error ?? ""));
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[420px_1fr]">
      <section className="h-fit space-y-5 rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-20">
        <div>
          <h1 className="text-xl font-bold">AI Influencer</h1>
          <p className="text-xs text-mute">Design a consistent character. You get 4 portrait variations to pick from.</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs text-mute">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Nova" className="w-full rounded-lg border border-line bg-black/40 p-3 text-sm outline-none focus:border-accent" />
        </label>
        <div>
          <span className="mb-1.5 block text-xs text-mute">Style · {INFLUENCER_STYLES.length}</span>
          <div className="grid grid-cols-4 gap-2">
            {INFLUENCER_STYLES.map((s, i) => (
              <button key={s} onClick={() => setStyle(s)} className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 ${style === s ? "border-accent" : "border-transparent"}`}>
                <PromptMedia prompt={`${s} fashion outfit`} seed={i} ratio="3:4" width={200} />
                <span className="absolute bottom-1 left-1.5 text-[11px] font-semibold">{s}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-xs text-mute">Features</span>
          <div className="flex flex-wrap gap-1.5">
            {LOOKS.map((l) => (
              <button key={l} onClick={() => toggle(l)} className={`rounded-full border px-3 py-1 text-xs ${looks.includes(l) ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs text-mute">Vibe (optional)</span>
          <input value={vibe} onChange={(e) => setVibe(e.target.value)} maxLength={120} placeholder="travel vlogger in Lisbon, warm and playful" className="w-full rounded-lg border border-line bg-black/40 p-3 text-sm outline-none focus:border-accent" />
        </label>
        <GenerateButton ready={ready} signedIn={!!user} cost={COST} disabled={!!user && user.credits < COST} onClick={submit} next="/influencer" label="Create character" />
        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </section>
      <section>
        <h2 className="mb-4 text-sm font-medium text-mute">Your characters</h2>
        {mine.length === 0 ? (
          <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-line text-sm text-mute">Pick a style and create your first character.</div>
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
