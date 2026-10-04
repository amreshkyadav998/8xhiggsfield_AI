"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Media from "@/components/Media";
import { Logo } from "@/components/Nav";
import { byTopic } from "@/lib/media";
import { PROJECTS, toolHref, type Project } from "@/lib/showcase";

function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 backdrop-blur md:p-10" onClick={onClose} role="dialog" aria-modal aria-label={p.title}>
      <div className="mx-auto max-w-5xl rounded-3xl border border-line bg-bg p-5 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent">Project · by @{p.by}</div>
            <h3 className="mt-1 text-3xl font-black">{p.title}</h3>
            <p className="mt-1 text-mute">{p.logline}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-white" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {p.shots.map((s, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-line bg-panel">
              <div className="aspect-video">
                <Media item={byTopic(s.topic, s.i, s.kind)} ratio="16:9" width={800} />
              </div>
              <div className="flex items-start gap-3 p-4">
                <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-mute">
                  Shot {i + 1} · {s.kind}
                </span>
                <p className="flex-1 text-sm">{s.prompt}</p>
                <Link href={toolHref(s)} className="shrink-0 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-black">
                  Remix
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  return (
    <section id="projects" className="mt-16 scroll-mt-24">
      <h2 className="text-2xl font-black uppercase tracking-tight text-accent sm:text-3xl md:text-4xl">Explore the inside of every project</h2>
      <p className="mt-1 text-mute">See every prompt and shot behind a project, then remix any of them.</p>
      <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PROJECTS.map((p, n) => (
          <button key={p.id} onClick={() => setOpen(p)} className="group overflow-hidden rounded-2xl border border-line bg-panel p-1.5 text-left hover:border-mute">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Media item={byTopic(p.shots[0].topic, p.shots[0].i, "image")} ratio="16:10" width={600} className="transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className={`absolute bottom-3 left-4 right-4 text-2xl font-black uppercase leading-none ${n % 2 ? "font-serif tracking-widest" : "tracking-tight"}`}>{p.title}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 text-sm">
              <Logo size={22} />
              <span className="flex-1 truncate font-medium">
                {p.title} <span className="text-mute">by {p.by}</span>
              </span>
              <span className="rounded-md border border-line px-2 py-0.5 text-xs text-mute">Public</span>
            </div>
          </button>
        ))}
      </div>
      {open && <ProjectModal p={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
