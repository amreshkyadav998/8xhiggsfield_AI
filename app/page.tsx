import Link from "next/link";
import { EFFECTS } from "@/lib/catalog";
import { artUrl } from "@/lib/art";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 pb-14 pt-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Image and video from a prompt.
          <br />
          <span className="text-mute">See the credit cost before you generate.</span>
        </h1>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/studio" className="rounded-full bg-accent px-6 py-3 font-semibold text-black hover:brightness-95">
            Open the studio
          </Link>
          <Link href="/effects" className="rounded-full border border-line px-6 py-3 hover:border-white">
            Browse effects
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-5 text-xl font-semibold">Start from a look</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {EFFECTS.slice(0, 4).map((e) => (
            <Link key={e.id} href={`/studio?effect=${e.id}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artUrl(e.prompt, 7, false, e.hue)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 font-medium">{e.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
