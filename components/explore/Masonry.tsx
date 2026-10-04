"use client";
import Link from "next/link";
import Media from "@/components/Media";
import { byTopic, STYLE_FILTERS } from "@/lib/media";
import { toolHref, type Tile } from "@/lib/showcase";

export function TileCard({ t, h }: { t: Tile; h: string }) {
  return (
    <Link href={toolHref(t)} className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl bg-panel" style={{ aspectRatio: h }}>
      <Media item={byTopic(t.topic, t.i, t.kind)} ratio={t.tall ? "3:4" : "4:5"} width={600} filter={t.style ? STYLE_FILTERS[t.style] : undefined} className="transition-transform duration-700 group-hover:scale-[1.03]" />
      {t.style && <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold backdrop-blur">{t.style}</span>}
      <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="line-clamp-2 text-sm">{t.prompt}</p>
        <span className="mt-2 inline-block rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-black">{t.style ? "Use in Genjutsu" : "Recreate"}</span>
      </div>
    </Link>
  );
}

export default function Masonry({
  id,
  title,
  sub,
  tiles,
  cols = 3,
  cta,
}: {
  id?: string;
  title: string;
  sub: string;
  tiles: Tile[];
  cols?: 3 | 5;
  cta?: { label: string; href: string };
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-accent md:text-4xl">{title}</h2>
          <p className="mt-1 text-mute">{sub}</p>
        </div>
        {cta && (
          <Link href={cta.href} className="rounded-xl bg-accent px-5 py-3 font-bold text-black shadow-[0_4px_0_#7a9400] transition-transform hover:-translate-y-0.5">
            {cta.label}
          </Link>
        )}
      </div>
      <div className={`gap-3 ${cols === 5 ? "columns-2 md:columns-3 xl:columns-5" : "columns-2 md:columns-3"}`}>
        {tiles.map((t, n) => (
          <TileCard key={n} t={t} h={t.tall ? "3 / 4.4" : n % 3 === 1 ? "1 / 1" : "4 / 3"} />
        ))}
      </div>
    </section>
  );
}
