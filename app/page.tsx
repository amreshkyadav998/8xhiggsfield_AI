import Link from "next/link";
import Media from "@/components/Media";
import Masonry from "@/components/explore/Masonry";
import Projects from "@/components/explore/Projects";
import Countdown from "@/components/explore/Countdown";
import Dot from "@/components/explore/Dot";
import { INFLUENCER_STYLES } from "@/lib/catalog";
import { byTopic, STYLE_FILTERS } from "@/lib/media";
import { FEATURE_CHIPS, GENJUTSU_SHOWCASE, MARKETING, SEEDANCE, SOUL, VFX } from "@/lib/showcase";

const TOOLS = [
  { href: "/video?model=seed", icon: "▮▮▮", name: "Seedance 2.5", tag: "TOP", desc: "The most advanced video model", chip: "Video" },
  { href: "/influencer", icon: "✦", name: "AI Influencer", tag: "FREE", desc: "Build your next hype machine" },
  { href: "/genjutsu", icon: "∿", name: "Genjutsu", tag: "FREE", desc: "One video, many versions" },
  { href: "/mcp", icon: "✺", name: "MCP for Claude", desc: "Generate images and videos in Claude" },
  { href: "/audio", icon: "♪", name: "Voice & Score", desc: "Narration and music in seconds" },
  { href: "/api-docs", icon: "{ }", name: "API", tag: "NEW", desc: "Same models, over HTTP" },
];

const btn = "inline-block rounded-xl px-6 py-3 font-bold transition-transform hover:-translate-y-0.5";
const lime = `${btn} bg-accent text-black shadow-[0_4px_0_#7a9400]`;

export default function Explore() {
  return (
    <div className="px-4 pb-4 pt-5 md:px-6">
      {/* 1. Feature tiles */}
      <section className="grid gap-5 lg:grid-cols-3">
        <Link href="/influencer" className="group">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-panel p-4">
            <div className="absolute inset-0">
              <Media item={byTopic("fashion", 1, "image")} ratio="16:10" width={900} className="opacity-60 transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative w-fit rounded-xl border border-white/10 bg-black/70 p-3 backdrop-blur">
              <div className="mb-2 text-xs text-mute">Style · {INFLUENCER_STYLES.length}</div>
              <div className="grid grid-cols-3 gap-1.5">
                {INFLUENCER_STYLES.slice(0, 6).map((s, i) => (
                  <span key={s} className="relative h-16 w-16 overflow-hidden rounded-lg md:h-[72px] md:w-[72px]">
                    <Media item={byTopic(i % 2 ? "fashion" : "portrait", i + 2, "image")} ratio="1:1" width={160} />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold drop-shadow">{s}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <h3 className="mt-3 text-lg font-black uppercase tracking-tight">AI Influencer — viral by design</h3>
          <p className="text-sm text-mute">Your next viral creator starts now</p>
        </Link>

        <Link href="/genjutsu" className="group">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-black to-lime-900 p-4">
            <div className="absolute left-[6%] top-[22%] h-[62%] w-[52%] -rotate-3 overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl">
              <Media item={byTopic("dance", 0, "video")} ratio="4:5" width={500} />
              <span className="absolute bottom-2 left-3 text-2xl font-black italic">INPUT</span>
            </div>
            <div className="absolute right-[5%] top-[8%] h-[66%] w-[54%] rotate-2 overflow-hidden rounded-xl border-2 border-accent/60 shadow-2xl transition-transform duration-500 group-hover:rotate-0">
              <Media item={byTopic("dance", 0, "video")} ratio="4:5" width={500} filter={STYLE_FILTERS.Anime} />
              <span className="absolute bottom-2 right-3 text-2xl font-black italic text-accent">GENJUTSU</span>
            </div>
          </div>
          <h3 className="mt-3 text-lg font-black uppercase tracking-tight">Genjutsu restyle</h3>
          <p className="text-sm text-mute">Keep the motion, change the world: restyle any video in one click</p>
        </Link>

        <Link href="/mcp" className="group">
          <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-300 text-black">
            <div className="flex items-center gap-3">
              <Dot kind="director" size={56} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Works inside</div>
                <div className="text-2xl font-black md:text-3xl">ChatGPT · Claude</div>
              </div>
            </div>
            <code className="absolute bottom-4 rounded bg-black px-2 py-1 text-xs text-accent">mcp.frameforge.app</code>
          </div>
          <h3 className="mt-3 text-lg font-black uppercase tracking-tight">Frameforge extension in your AI chat</h3>
          <p className="text-sm text-mute">Your entire AI production studio, inside the assistant you already use</p>
        </Link>
      </section>

      {/* 2. Promo + tools */}
      <section className="mt-12 grid gap-4 xl:grid-cols-[1.45fr_2fr]">
        <div className="relative min-h-80 overflow-hidden rounded-2xl">
          <div className="absolute inset-0">
            <Media item={byTopic("mountain", 0, "video")} ratio="16:9" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-r from-black/70 via-black/30 to-transparent p-7">
            <div>
              <div className="text-4xl font-black uppercase leading-[0.95] md:text-5xl">Unlimited Nano Pro</div>
              <div className="text-4xl font-black uppercase leading-[0.95] text-accent md:text-5xl">With personal 50% off</div>
              <p className="mt-3 text-white/80">7-day unlimited Nano Pro, Soul and Kinetic</p>
            </div>
            <div className="relative w-fit">
              <Link href="/pricing" className={`${lime} px-16 text-lg`}>
                Get with 50% OFF
              </Link>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-pink-600 px-2 py-0.5 text-xs font-semibold">
                <Countdown />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.name} href={t.href} className="flex min-h-40 flex-col justify-between rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-mute hover:bg-[#16161b]">
              <div className="flex items-start justify-between">
                <span className="text-lg font-bold text-white/90">{t.icon}</span>
                {t.chip && <span className="rounded-xl bg-black/40 px-2.5 py-1 text-xs text-mute">▶ {t.chip}</span>}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[17px] font-bold">
                  {t.name}
                  {t.tag && <span className={`rounded px-1.5 text-[11px] font-black italic ${t.tag === "TOP" ? "bg-pink-600" : "bg-accent text-black"}`}>{t.tag}</span>}
                </div>
                <p className="mt-1 text-sm text-mute">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. AI Influencer hero */}
      <section className="relative mt-12 overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#2a2a2e] to-[#0d0d10]">
        <div className="absolute bottom-0 left-0 hidden h-[92%] w-[26%] md:block">
          <Media item={byTopic("man", 4, "image")} ratio="3:4" width={600} className="[mask-image:linear-gradient(to_right,black_55%,transparent)]" />
        </div>
        <div className="absolute bottom-0 right-0 hidden h-[92%] w-[26%] md:block">
          <Media item={byTopic("portrait", 6, "image")} ratio="3:4" width={600} className="[mask-image:linear-gradient(to_left,black_55%,transparent)]" />
        </div>
        <div className="relative px-6 py-16 text-center">
          <span className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">🎁 Try Free</span>
          <div className="mt-6 text-xl font-black uppercase">AI Influencer</div>
          <h2 className="mt-2 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Build your next
            <br />
            <span className="text-white/60">hype machine</span>
          </h2>
          <p className="mt-4 text-lg text-mute">Pick the look. Add motion. Build hype.</p>
          <Link href="/influencer" className={`${lime} mt-8`}>
            Create your own AI Influencer
          </Link>
        </div>
      </section>

      {/* 4. Visual effects */}
      <Masonry id="vfx" title="Visual effects" sub="Big-budget visual effects, from explosions to surreal transformations." tiles={VFX} cols={5} cta={{ label: "Start generating", href: "/video" }} />

      {/* 5. Genjutsu */}
      <section className="mt-16 rounded-3xl border border-line bg-black p-6 md:p-9">
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">✦ New model</span>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-accent md:text-5xl">Frameforge Genjutsu</h2>
            <p className="mt-2 max-w-2xl text-lg text-mute">Reality manipulation: keep the motion you filmed and swap the whole look while everything else stays as shot.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/genjutsu" className={lime}>
              Try free
            </Link>
            <Link href="/genjutsu" className={`${btn} bg-white text-black shadow-[0_4px_0_#999]`}>
              Learn more
            </Link>
          </div>
        </div>
        <div className="mt-8 columns-2 gap-3 md:columns-3 xl:columns-5">
          {GENJUTSU_SHOWCASE.map((t, n) => (
            <Link key={n} href="/genjutsu" className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl" style={{ aspectRatio: t.tall ? "3 / 4.4" : "4 / 3" }}>
              <Media item={byTopic(t.topic, t.i, "video")} filter={STYLE_FILTERS[t.style!]} />
              <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold backdrop-blur">{t.style}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Seedance */}
      <Masonry title="Seedance 2.5" sub="The most advanced AI video model." tiles={SEEDANCE} />

      {/* 7. Agent banner */}
      <section className="relative mt-16 overflow-hidden rounded-3xl bg-black p-[3px] shadow-[0_0_60px_rgba(209,254,23,.35)]">
        <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(ellipse_at_center,#1f2a00_0%,#050505_70%)] px-6 py-16">
          <div className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_120px_rgba(209,254,23,.45)]" />
          <div className="absolute left-[6%] top-1/2 hidden w-64 -translate-y-1/2 -rotate-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur lg:block">
            <div className="mb-2 flex justify-between text-sm">
              <span>👤 UGC Creator</span>
              <span className="text-mute">2/2</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg">
                  <Media item={byTopic("portrait", i + 7, "image")} ratio="3:4" width={160} />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-[6%] top-8 hidden w-60 rotate-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur lg:block">
            <div className="mb-2 text-sm">📣 Marketing</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1].map((i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg">
                  <Media item={byTopic("product", i + 5, "image")} ratio="1:1" width={200} />
                </div>
              ))}
            </div>
            <span className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">Analyzing hooks</span>
          </div>
          <div className="relative text-center">
            <div className="text-5xl font-black uppercase tracking-tight text-accent md:text-7xl">Director mode</div>
            <p className="mt-3 text-lg text-white/80">One agent for your entire creative stack</p>
            <Link href="/mcp" className={`${btn} mt-8 bg-white text-black shadow-[0_4px_0_#999]`}>
              Try Director mode
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Soul (image) */}
      <Masonry title="Soul" sub="Photoreal stills with fashion-grade lighting." tiles={SOUL} cta={{ label: "Generate images", href: "/image?model=soul" }} />

      {/* 9. MCP Dots */}
      <section id="dots" className="relative mt-16 overflow-hidden rounded-3xl border border-line bg-[radial-gradient(ellipse_at_top,#2a2a2e,#0b0b0d_70%)] px-6 py-16 text-center">
        {[
          ["director", "Cinematic Director", "left-[10%] top-[22%]"],
          ["creator", "Character Creator", "left-[18%] bottom-[12%]"],
          ["designer", "Motion Designer", "right-[12%] top-[12%]"],
          ["lead", "Content Lead", "right-[10%] bottom-[16%]"],
        ].map(([k, label, pos]) => (
          <div key={k} className={`absolute hidden flex-col items-center gap-2 lg:flex ${pos}`}>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">{label}</span>
            <Dot kind={k as "director"} />
          </div>
        ))}
        <h2 className="relative text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
          Use ChatGPT dots
          <br />
          with Frameforge MCP
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-mute">Plan and make a creative project step by step with Frameforge Dots in ChatGPT or Claude.</p>
        <Link href="/mcp" className={`${lime} relative mt-8`}>
          Connect Frameforge
        </Link>
      </section>

      {/* 10. Marketing */}
      <Masonry title="Marketing studio" sub="See what creators and brands make: ads, UGC and product films." tiles={MARKETING} />

      {/* 11. Projects */}
      <Projects />

      {/* 12. More features */}
      <section className="mt-24 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tight md:text-6xl">Explore more AI features</h2>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-3">
          {FEATURE_CHIPS.map((c) => (
            <Link key={c.label} href={c.href} className="rounded-xl bg-panel px-5 py-2.5 text-lg text-white/80 transition-colors hover:bg-[#1d1d22] hover:text-white">
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
