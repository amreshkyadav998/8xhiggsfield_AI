import Link from "next/link";
import { EFFECTS, GENJUTSU_STYLES, INFLUENCER_STYLES, MODELS } from "@/lib/catalog";
import { artUrl } from "@/lib/art";

const Art = ({ seed, hue, prompt, className = "" }: { seed: number; hue: number; prompt: string; className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={artUrl(prompt, seed, true, hue)} alt="" className={`h-full w-full object-cover ${className}`} />
);

const TOOLS = [
  { href: "/video", kind: "Video", name: MODELS[2].name + " 2.5", tag: "TOP", desc: "The most advanced video model", icon: "▶" },
  { href: "/image", kind: "Image", name: "Soul", tag: "", desc: "Photoreal portraits and fashion", icon: "◐" },
  { href: "/audio", kind: "Audio", name: "Voiceover", tag: "NEW", desc: "Narration and music in seconds", icon: "♪" },
  { href: "/influencer", kind: "Character", name: "AI Influencer", tag: "FREE", desc: "Build your next creator", icon: "✦" },
];

export default function Explore() {
  return (
    <div className="px-4 pb-16 pt-5 md:px-6">
      {/* Feature tiles */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Link href="/influencer" className="group">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-panel p-5">
            <div className="absolute inset-0 opacity-50">
              <Art seed={11} hue={300} prompt="influencer" />
            </div>
            <div className="relative w-fit rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur">
              <div className="mb-2 text-xs text-mute">Style · {INFLUENCER_STYLES.length}</div>
              <div className="grid grid-cols-3 gap-1.5">
                {INFLUENCER_STYLES.slice(0, 6).map((s, i) => (
                  <span key={s} className="relative h-14 w-16 overflow-hidden rounded-lg">
                    <Art seed={i} hue={i * 50} prompt={s} />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold">{s}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <h3 className="mt-3 font-black uppercase tracking-tight">AI Influencer — viral by design</h3>
          <p className="text-sm text-mute">Your next viral creator starts now</p>
        </Link>

        <Link href="/genjutsu" className="group">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
            <Art seed={4} hue={265} prompt="restyle" className="transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute bottom-4 left-5 text-3xl font-black">{GENJUTSU_STYLES.length} STYLES</span>
          </div>
          <h3 className="mt-3 font-black uppercase tracking-tight">Genjutsu restyle</h3>
          <p className="text-sm text-mute">Keep the motion, change the world: restyle any video in one click</p>
        </Link>

        <Link href="/mcp" className="group">
          <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-zinc-100 to-zinc-300 text-black">
            <div className="text-center">
              <div className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Works inside</div>
              <div className="text-3xl font-black">ChatGPT · Claude</div>
              <code className="mt-3 inline-block rounded bg-black px-2 py-1 text-xs text-accent">mcp.frameforge.app</code>
            </div>
          </div>
          <h3 className="mt-3 font-black uppercase tracking-tight">Frameforge extension in your AI chat</h3>
          <p className="text-sm text-mute">Your entire AI production studio, inside the assistant you already use</p>
        </Link>
      </section>

      {/* Promo + tools */}
      <section className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Link href="/pricing" className="relative min-h-56 overflow-hidden rounded-2xl border border-line">
          <Art seed={9} hue={150} prompt="promo" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-4xl font-black uppercase leading-none md:text-5xl">Unlimited Nano Pro</div>
            <div className="text-4xl font-black uppercase leading-none md:text-5xl">
              with Pro <span className="text-accent">50% off</span>
            </div>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((t) => (
            <Link key={t.name} href={t.href} className="flex flex-col justify-between rounded-2xl border border-line bg-panel p-4 hover:border-mute">
              <div className="flex items-center justify-between text-mute">
                <span className="text-xl">{t.icon}</span>
                <span className="rounded-lg bg-black/40 px-2 py-0.5 text-xs">{t.kind}</span>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 font-semibold">
                  {t.name}
                  {t.tag && <span className="rounded bg-pink-600 px-1.5 text-[10px] font-bold italic">{t.tag}</span>}
                </div>
                <p className="text-xs text-mute">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Effects rail */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase">Trending effects</h2>
            <p className="text-sm text-mute">Presets load a prompt into the generator. Edit it before you spend credits.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {EFFECTS.map((e) => (
            <Link key={e.id} href={`/${e.kind}?effect=${e.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-line">
                <Art seed={7} hue={e.hue} prompt={e.prompt} className="transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] uppercase">{e.kind}</span>
              </div>
              <div className="mt-2 text-sm font-medium">{e.name}</div>
              <div className="text-xs text-mute">{e.tag}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
