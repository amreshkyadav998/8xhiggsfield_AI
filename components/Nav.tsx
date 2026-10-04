"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

const links = [
  ["/studio", "Studio"],
  ["/effects", "Effects"],
  ["/pricing", "Pricing"],
];

export default function Nav() {
  const { user, ready, signOut } = useApp();
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-line bg-bg/85 px-6 py-3 backdrop-blur">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Frame<span className="text-accent">forge</span>
      </Link>
      <nav className="flex gap-1 text-sm">
        {links.map(([h, l]) => (
          <Link
            key={h}
            href={h}
            className={`rounded-md px-3 py-1.5 transition-colors hover:bg-panel ${path.startsWith(h) ? "bg-panel text-white" : "text-mute"}`}
          >
            {l}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3 text-sm">
        {ready && user ? (
          <>
            <Link href="/pricing" className="rounded-full border border-line px-3 py-1 font-medium hover:border-accent" title="Credits">
              <span className="text-accent">●</span> {user.credits} credits
            </Link>
            <button onClick={signOut} className="text-mute hover:text-white">
              Sign out
            </button>
          </>
        ) : (
          ready && (
            <Link href="/login" className="rounded-full bg-accent px-4 py-1.5 font-semibold text-black hover:brightness-95">
              Sign in
            </Link>
          )
        )}
      </div>
    </header>
  );
}
