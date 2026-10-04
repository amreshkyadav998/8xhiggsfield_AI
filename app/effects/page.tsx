"use client";
import Link from "next/link";
import { useState } from "react";
import { EFFECTS } from "@/lib/catalog";
import { artUrl } from "@/lib/art";

const FILTERS = ["all", "video", "image"] as const;

export default function Effects() {
  const [f, setF] = useState<(typeof FILTERS)[number]>("all");
  const list = EFFECTS.filter((e) => f === "all" || e.kind === f);
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Effects</h1>
      <p className="mt-1 text-mute">Presets that load a prompt and settings into the studio. Tweak them before you spend credits.</p>
      <div className="my-6 flex gap-2">
        {FILTERS.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize ${f === x ? "border-accent text-accent" : "border-line text-mute hover:text-white"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((e) => (
          <Link key={e.id} href={`/studio?effect=${e.id}`} className="group overflow-hidden rounded-xl border border-line bg-panel">
            <div className="aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artUrl(e.prompt, 3, false, e.hue)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{e.name}</span>
                <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] uppercase text-mute">{e.kind}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-mute">{e.prompt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
