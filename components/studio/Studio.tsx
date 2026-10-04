"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { EFFECTS, IMAGE_RES, MODELS, QUALITIES, RATIOS, VIDEO_RES, fmt, price, ratioBox, type Kind, type Quality, type Ratio, type Res } from "@/lib/catalog";
import { byTopic } from "@/lib/media";
import { jobStatus, markKey, useApp, type Job } from "@/lib/store";
import Media from "@/components/Media";
import Dropdown, { chipCls, rowCls } from "./Dropdown";
import FilterMenu, { NO_FILTERS, activeCount, inDateRange, type Filters } from "./FilterMenu";
import Feed, { type Item } from "./Feed";

type Aspect = "Auto" | Ratio;

/** "Auto" aspect reads the prompt: vertical words pick 9:16, wide words 16:9. */
function resolveRatio(a: Aspect, prompt: string, kind: Kind): Ratio {
  if (a !== "Auto") return a;
  const p = prompt.toLowerCase();
  if (/\b(tiktok|reel|reels|story|stories|vertical|shorts|phone)\b/.test(p)) return "9:16";
  if (/\b(landscape|wide|cinematic|panorama|banner|widescreen)\b/.test(p)) return "16:9";
  if (/\b(portrait|headshot|selfie)\b/.test(p)) return "3:4";
  return kind === "video" ? "16:9" : "4:5";
}

const COPY: Record<Kind, { placeholder: string; sub: string; hero: [string, number, "image" | "video"][] }> = {
  image: {
    placeholder: "Describe the scene you imagine",
    sub: "Describe a scene, character, mood, or style, and watch it come to life",
    hero: [["portrait", 4, "image"], ["neon", 2, "image"], ["fashion", 6, "image"], ["man", 5, "image"]],
  },
  video: {
    placeholder: "Describe the shot: subject, motion, camera",
    sub: "Direct the motion and the camera. Clips are priced per second",
    hero: [["car", 1, "video"], ["dance", 3, "video"], ["ocean", 2, "video"], ["neon", 4, "video"]],
  },
  audio: {
    placeholder: "Write a voiceover script, or describe the music you want",
    sub: "Narration from your script, or an original score for your cut",
    hero: [["dance", 6, "image"], ["sunset", 1, "image"], ["coffee", 3, "image"], ["portrait", 8, "image"]],
  },
};

const Ico = ({ r }: { r: Aspect }) => {
  if (r === "Auto") return <span className="grid h-4 w-4 place-items-center rounded-sm border border-dashed border-current text-[8px]">A</span>;
  const { w, h } = ratioBox(r);
  const s = 16 / Math.max(w, h);
  return <span className="inline-block rounded-[3px] border-2 border-current" style={{ width: w * s, height: h * s }} />;
};

export default function Studio({ kind }: { kind: Kind }) {
  const params = useSearchParams();
  const { user, ready, jobs, generate, marks, now } = useApp();
  const models = MODELS.filter((m) => m.kind === kind);
  const fx = EFFECTS.find((e) => e.id === params.get("effect") && e.kind === kind);

  const [modelId, setModelId] = useState(models.find((m) => m.id === params.get("model"))?.id ?? models[0].id);
  const [prompt, setPrompt] = useState(fx?.prompt ?? params.get("prompt") ?? "");
  const [aspect, setAspect] = useState<Aspect>("Auto");
  const [quality, setQuality] = useState<Quality>("High");
  const [res, setRes] = useState<Res>(kind === "video" ? "720p" : "2K");
  const [count, setCount] = useState(1);
  const [seconds, setSeconds] = useState(5);
  const [refs, setRefs] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [modelQ, setModelQ] = useState("");
  const [cols, setCols] = useState(4);
  const box = useRef<HTMLTextAreaElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(220);
  const [vw, setVw] = useState(1280);

  // Keep results clear of the pinned prompt bar, whose height changes with wrapping and references.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);
  // The slider sets desktop density; smaller screens cap the column count.
  const effCols = Math.min(cols, vw < 640 ? 2 : vw < 900 ? 3 : vw < 1200 ? 4 : 6);

  useEffect(() => {
    try {
      const c = Number(localStorage.getItem("hf.cols"));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (c >= 2 && c <= 6) setCols(c);
    } catch {}
  }, []);
  const changeCols = (c: number) => {
    setCols(c);
    try {
      localStorage.setItem("hf.cols", String(c));
    } catch {}
  };

  const model = MODELS.find((m) => m.id === modelId)!;
  const secs = kind === "video" ? seconds : 1;
  const n = kind === "image" ? count : 1;
  const opts = { seconds: secs, count: n, quality: kind === "image" ? quality : undefined, res: kind === "audio" ? undefined : res };
  const { list, charge } = price(model, opts);
  const short = !!user && user.credits < charge;

  // Characters created in AI Influencer become @mentions.
  const characters = useMemo(() => {
    const out = new Map<string, string>();
    for (const j of jobs) {
      const m = /^AI influencer ([^,]+), (.+)$/.exec(j.prompt);
      if (m && !out.has(m[1])) out.set(m[1], m[2]);
    }
    return [...out].map(([name, desc]) => ({ name, desc }));
  }, [jobs]);

  const items: Item[] = useMemo(
    () =>
      jobs
        .filter((j) => j.kind === kind)
        .filter((j) => !filters.models.length || filters.models.includes(j.modelId))
        .filter((j) => inDateRange(filters, j.startedAt))
        .filter((j) => !(filters.hideFailed && j.canceled))
        .flatMap((j) => (j.canceled ? [{ job: j, seed: j.seeds[0] }] : j.seeds.map((seed) => ({ job: j, seed }))))
        .filter(({ job, seed }) => (!filters.liked || marks[markKey(job, seed)]?.liked) && (!filters.downloaded || marks[markKey(job, seed)]?.downloaded)),
    [jobs, kind, filters, marks]
  );
  const running = jobs.filter((j) => j.kind === kind && ["queued", "rendering"].includes(jobStatus(j, now).status)).length;

  const pickModel = (id: string) => {
    setModelId(id);
    const m = MODELS.find((x) => x.id === id)!;
    if (m.durations && !m.durations.includes(seconds)) setSeconds(m.durations[0]);
  };
  const reuse = (j: Job) => {
    setPrompt(j.prompt);
    if (MODELS.some((m) => m.id === j.modelId && m.kind === kind)) pickModel(j.modelId);
    setAspect(j.ratio);
    if (j.quality) setQuality(j.quality);
    if (j.res) setRes(j.res);
    if (kind === "video") setSeconds(j.seconds);
    if (kind === "image") setCount(j.count);
    box.current?.focus();
  };
  const addRefs = (files: FileList | null) => {
    if (!files) return;
    const imgs = [...files].filter((f) => f.type.startsWith("image/")).slice(0, 4 - refs.length);
    setRefs((r) => [...r, ...imgs.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))]);
  };
  const mention = (name: string) => {
    setPrompt((p) => `${p}${p && !p.endsWith(" ") ? " " : ""}@${name} `);
    box.current?.focus();
  };
  const submit = () => {
    // Expand @Name into the character's description so the output matches the character.
    const expanded = prompt.trim().replace(/@([\w-]+)/g, (all, name: string) => {
      const c = characters.find((x) => x.name.toLowerCase() === name.toLowerCase());
      return c ? `${c.name} (${c.desc})` : all;
    });
    const r = generate({
      kind,
      modelId,
      prompt: expanded,
      ratio: kind === "audio" ? "16:9" : resolveRatio(aspect, expanded, kind),
      seconds: secs,
      count: n,
      quality: opts.quality,
      res: opts.res,
      refs: refs.length || undefined,
      hue: fx && fx.prompt === prompt ? fx.hue : undefined,
    });
    setError(r.ok ? "" : (r.error ?? ""));
    if (r.ok) {
      setRefs([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const ratioNow = kind === "audio" ? null : resolveRatio(aspect, prompt, kind);
  const filtered = activeCount(filters) > 0;

  return (
    <div className="relative min-h-[calc(100vh-61px)] px-3 pt-4 md:px-6" style={{ paddingBottom: barH + 40 }}>
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {running > 0 && <span className="mr-auto rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">{running} generating…</span>}
        <FilterMenu kind={kind} value={filters} onChange={setFilters} />
        <label className="hidden h-11 items-center gap-3 rounded-xl border border-line bg-[#141417] px-4 sm:flex" title="Grid size">
          <span className="text-xs text-mute">▦</span>
          <input type="range" min={2} max={6} value={8 - cols} onChange={(e) => changeCols(8 - Number(e.target.value))} aria-label="Grid size" className="w-36 accent-white" />
        </label>
      </div>

      {/* Feed or hero */}
      {items.length ? (
        <div className="mt-4">
          <Feed items={items} cols={effCols} onReuse={reuse} />
        </div>
      ) : filtered ? (
        <div className="mt-24 text-center text-mute">
          No results match these filters.{" "}
          <button onClick={() => setFilters(NO_FILTERS)} className="text-accent underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center text-center md:mt-14">
          <div className="flex items-center">
            {COPY[kind].hero.map(([t, i, k], idx) => (
              <div
                key={idx}
                className={`-mx-2 h-20 w-20 overflow-hidden border-[3px] border-white/15 shadow-2xl sm:-mx-3 sm:h-32 sm:w-32 sm:border-4 md:h-36 md:w-40 ${idx === 2 ? "rounded-full" : "rounded-2xl"}`}
                style={{ transform: `rotate(${[-8, 4, -3, 6][idx]}deg) translateY(${[6, -4, 2, -2][idx]}px)`, zIndex: idx === 2 ? 3 : idx }}
              >
                <Media item={byTopic(t, i, k)} ratio="1:1" width={300} />
              </div>
            ))}
          </div>
          <h1 className="mt-8 text-2xl font-black uppercase leading-none tracking-tight sm:text-3xl md:text-4xl">
            Start creating with
            <br />
            <span className="text-accent">Frameforge {model.name}</span>
          </h1>
          <p className="mt-3 max-w-xl px-2 text-base text-mute sm:text-lg">{COPY[kind].sub}</p>
        </div>
      )}

      {/* Prompt bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-2 pb-2 sm:px-3 sm:pb-3 md:px-6 md:pb-5">
        {/* No backdrop-filter below sm: it would trap the bottom-sheet dropdowns (position: fixed) inside the bar. */}
        <div
          ref={bar}
          className="pointer-events-auto mx-auto flex max-w-[1500px] gap-3 rounded-3xl border border-line bg-[#141417] p-3 shadow-[0_-10px_60px_rgba(0,0,0,.6)] sm:gap-4 sm:rounded-[28px] sm:bg-[#141417]/95 sm:p-4 sm:backdrop-blur md:p-5 max-md:flex-col"
        >
          <div className="min-w-0 flex-1">
            {refs.length > 0 && (
              <div className="mb-3 flex gap-2">
                {refs.map((r, i) => (
                  <div key={r.url} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={r.name} className="h-full w-full object-cover" />
                    <button onClick={() => setRefs(refs.filter((_, j) => j !== i))} aria-label={`Remove ${r.name}`} className="absolute inset-0 grid place-items-center bg-black/60 text-sm opacity-0 group-hover:opacity-100">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={box}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !short) submit();
              }}
              rows={vw < 640 ? 1 : 2}
              maxLength={1000}
              placeholder={COPY[kind].placeholder}
              aria-label="Prompt"
              className="w-full resize-none bg-transparent px-1 text-base outline-none placeholder:text-mute sm:text-[17px]"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
              {kind !== "audio" && (
                <div className={`${chipCls()} gap-0 px-0`}>
                  <label className="grid h-full cursor-pointer place-items-center px-3 text-xl sm:px-4" title="Add reference images">
                    +
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addRefs(e.target.files)} disabled={refs.length >= 4} />
                  </label>
                  <span className="h-6 w-px bg-line" />
                  <Dropdown
                    className="w-80"
                    trigger={(_, toggle) => (
                      <button onClick={toggle} className="grid h-10 place-items-center px-3 text-lg sm:h-12 sm:px-4" title="Mention a character">
                        @
                      </button>
                    )}
                  >
                    {(close) => (
                      <div>
                        <div className="px-3 pb-1 pt-2 text-sm text-mute">Your characters</div>
                        {characters.length ? (
                          characters.map((c) => (
                            <button key={c.name} className={rowCls()} onClick={() => (mention(c.name), close())}>
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-bold text-black">{c.name[0]}</span>
                              <span className="min-w-0">
                                <span className="block font-medium">@{c.name}</span>
                                <span className="block truncate text-xs text-mute">{c.desc}</span>
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-3 text-sm text-mute">
                            No characters yet.{" "}
                            <Link href="/influencer" className="text-accent underline">
                              Create one
                            </Link>{" "}
                            and mention it here to keep it consistent.
                          </p>
                        )}
                      </div>
                    )}
                  </Dropdown>
                </div>
              )}

              <Dropdown
                className="w-[22rem]"
                trigger={(open, toggle) => (
                  <button onClick={toggle} className={chipCls(open)}>
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-[9px] font-black text-black">{model.mark}</span>
                    {model.name} <span className="text-mute">›</span>
                  </button>
                )}
              >
                {(close) => (
                  <div className="max-h-[60vh] overflow-y-auto">
                    <div className="px-3 pb-2 pt-2 text-sm text-mute">Models</div>
                    <input value={modelQ} onChange={(e) => setModelQ(e.target.value)} placeholder="Search models" className="mb-2 w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none focus:bg-white/10" />
                    {models
                      .filter((m) => m.name.toLowerCase().includes(modelQ.toLowerCase()))
                      .map((m) => (
                        <button key={m.id} className={rowCls(m.id === modelId)} onClick={() => (pickModel(m.id), close())}>
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[10px] font-black">{m.mark}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 font-medium">
                              {m.name}
                              {m.tag && <span className="rounded bg-accent px-1 text-[9px] font-black text-black">{m.tag}</span>}
                            </span>
                            <span className="block truncate text-xs text-mute">{m.blurb}</span>
                          </span>
                          <span className="text-xs text-mute">
                            {fmt(m.cost)}
                            {m.kind === "video" ? "/s" : ""}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </Dropdown>

              {kind !== "audio" && (
                <Dropdown
                  className="w-64"
                  trigger={(open, toggle) => (
                    <button onClick={toggle} className={chipCls(open)} title="Aspect ratio">
                      <Ico r={aspect} /> {aspect}
                      {aspect === "Auto" && ratioNow && <span className="text-xs text-mute">{ratioNow}</span>}
                    </button>
                  )}
                >
                  {(close) => (
                    <div>
                      <div className="px-3 pb-1 pt-2 text-sm text-mute">Aspect ratio</div>
                      {(["Auto", ...RATIOS] as Aspect[]).map((r) => (
                        <button key={r} className={rowCls(aspect === r)} onClick={() => (setAspect(r), close())}>
                          <span className="grid w-5 place-items-center">
                            <Ico r={r} />
                          </span>
                          {r}
                          {r === "Auto" && <span className="text-xs text-mute">picks from your prompt</span>}
                          {aspect === r && <span className="ml-auto">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </Dropdown>
              )}

              {kind === "image" && (
                <Dropdown
                  align="right"
                  className="w-60"
                  trigger={(open, toggle) => (
                    <button onClick={toggle} className={chipCls(open)} title="Quality">
                      ◇ {quality}
                    </button>
                  )}
                >
                  {(close) => (
                    <div>
                      {QUALITIES.map((q) => (
                        <button key={q} className={rowCls(quality === q)} onClick={() => (setQuality(q), close())}>
                          {q} <span className="text-xs text-mute">{q === "High" ? "×1.5 credits" : "base price"}</span>
                          {quality === q && <span className="ml-auto">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </Dropdown>
              )}

              {kind !== "audio" && (
                <Dropdown
                  align="right"
                  className="w-56"
                  trigger={(open, toggle) => (
                    <button onClick={toggle} className={chipCls(open)} title="Resolution">
                      ◇ {res}
                    </button>
                  )}
                >
                  {(close) => (
                    <div>
                      {(kind === "video" ? VIDEO_RES : IMAGE_RES).map((r) => (
                        <button key={r} className={rowCls(res === r)} onClick={() => (setRes(r), close())}>
                          {r}{" "}
                          <span className="text-xs text-mute">{r === "4K" ? "×2" : r === "2K" || r === "1080p" ? "×1.3" : "base"}</span>
                          {res === r && <span className="ml-auto">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </Dropdown>
              )}

              {kind === "video" && (
                <Dropdown
                  align="right"
                  className="w-48"
                  trigger={(open, toggle) => (
                    <button onClick={toggle} className={chipCls(open)} title="Duration">
                      ◷ {seconds}s
                    </button>
                  )}
                >
                  {(close) => (
                    <div>
                      {model.durations!.map((d) => (
                        <button key={d} className={rowCls(seconds === d)} onClick={() => (setSeconds(d), close())}>
                          {d} seconds {seconds === d && <span className="ml-auto">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </Dropdown>
              )}

              {kind === "image" && (
                <div className={`${chipCls()} gap-3`}>
                  <button onClick={() => setCount(Math.max(1, count - 1))} disabled={count <= 1} aria-label="Fewer images" className="text-xl text-mute enabled:hover:text-white disabled:opacity-30">
                    −
                  </button>
                  <span className="w-8 text-center tabular-nums">{count}/4</span>
                  <button onClick={() => setCount(Math.min(4, count + 1))} disabled={count >= 4} aria-label="More images" className="text-xl text-mute enabled:hover:text-white disabled:opacity-30">
                    +
                  </button>
                </div>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          {ready && !user ? (
            <Link href={`/login?next=/${kind}`} className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3 text-center font-bold text-black md:grid md:w-56 md:py-5">
              <span className="text-lg md:text-xl">Sign in</span>
              <span className="text-sm font-semibold">to generate · {fmt(charge)} credits</span>
            </Link>
          ) : (
            <div className="flex shrink-0 flex-col items-stretch gap-1.5 md:items-center">
            <button
              onClick={submit}
              disabled={!prompt.trim() || short}
              title={short ? `You need ${fmt(charge - user!.credits)} more credits` : "Ctrl/⌘ + Enter"}
              className="flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-3 text-black shadow-[0_4px_0_#7a9400] transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 md:grid md:w-56 md:gap-0 md:px-10 md:py-5"
            >
              <span className="text-lg font-bold md:text-xl">Generate</span>
              <span className="flex items-center gap-1.5 text-base font-bold">
                ✦ {list !== charge && <s className="font-semibold opacity-50">{fmt(list)}</s>} {fmt(charge)}
              </span>
            </button>
            {short && (
              <Link href="/pricing" className="text-xs font-semibold text-accent underline">
                Need {fmt(charge - user!.credits)} more credits
              </Link>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
