"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { fmt } from "@/lib/catalog";

const LINKS: { href: string; label: string; badge?: string }[] = [
  { href: "/", label: "Explore" },
  { href: "/image", label: "Image" },
  { href: "/video", label: "Video" },
  { href: "/audio", label: "Audio" },
  { href: "/mcp", label: "MCP" },
  { href: "/api-docs", label: "API", badge: "New" },
  { href: "/influencer", label: "AI Influencer", badge: "Free" },
  { href: "/genjutsu", label: "Genjutsu", badge: "Top" },
];

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
      <rect width="34" height="34" rx="9" fill="#fff" />
      <path d="M9 23c3-9 6-12 8-12s1 5-2 9 2 3 4 0 3-6 5-6" fill="none" stroke="#000" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Nav() {
  const { user, ready, signOut } = useApp();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const pill = "flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-2 text-sm font-medium hover:border-mute";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-2.5 md:px-6">
        <Link href="/" aria-label="Frameforge home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-0.5 text-[15px] xl:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-colors hover:text-white ${active(l.href) ? (l.href === "/" ? "text-accent" : "bg-panel text-white") : "text-mute"}`}
            >
              {l.label}
              {l.badge && <span className="rounded bg-accent/15 px-1.5 text-[11px] font-semibold text-accent">{l.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/pricing" className={`${pill} relative`}>
            Pricing
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-pink-600 px-1.5 text-[10px] font-bold text-white">50% OFF</span>
          </Link>
          <Link href="/enterprise" className={`${pill} hidden md:flex`}>
            ✦ Enterprise
          </Link>
          <Link href="/assets" className={`${pill} hidden md:flex`}>
            <span className="text-accent">▰</span> Assets
          </Link>

          {ready &&
            (user ? (
              <div ref={ref} className="relative">
                <button onClick={() => setMenu(!menu)} aria-label="Account menu" className="grid h-10 w-10 place-items-center rounded-full border-2 border-accent bg-gradient-to-br from-lime-300 to-emerald-600 font-bold text-black">
                  {user.name[0]?.toUpperCase()}
                </button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-line bg-panel p-2 text-sm shadow-2xl">
                    <div className="px-3 py-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-mute">{user.email}</div>
                    </div>
                    <div className="mx-3 my-1 flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                      <span className="text-mute">Credits</span>
                      <span className="font-semibold text-accent">{fmt(user.credits)}</span>
                    </div>
                    <div className="px-3 pb-1 text-xs capitalize text-mute">Plan: {user.plan}</div>
                    {[
                      ["/assets", "My assets"],
                      ["/pricing", "Buy credits"],
                    ].map(([h, l]) => (
                      <Link key={h} href={h} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 hover:bg-black/40">
                        {l}
                      </Link>
                    ))}
                    <button onClick={() => (signOut(), setMenu(false))} className="block w-full rounded-lg px-3 py-2 text-left text-red-400 hover:bg-black/40">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-95">
                Sign in
              </Link>
            ))}
          <button onClick={() => setMobile(!mobile)} aria-label="Menu" className="rounded-lg border border-line px-2.5 py-2 xl:hidden">
            ☰
          </button>
        </div>
      </div>
      {mobile && (
        <nav className="grid grid-cols-2 gap-1 border-t border-line p-3 xl:hidden">
          {[...LINKS, { href: "/enterprise", label: "Enterprise" }, { href: "/assets", label: "Assets" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobile(false)} className={`rounded-lg px-3 py-2 text-sm ${active(l.href) ? "bg-panel text-white" : "text-mute"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
