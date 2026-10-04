"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmt } from "@/lib/catalog";

// Nudges an upgrade when the balance can't cover a typical generation.
export default function CreditToast() {
  const { user } = useApp();
  const [hiddenAt, setHiddenAt] = useState<number | null>(null);
  if (!user || user.credits >= 10 || hiddenAt === user.credits) return null;
  return (
    <div role="status" className="fixed right-5 top-20 z-50 flex items-center gap-4 rounded-2xl border border-line bg-panel py-3 pl-5 pr-3 shadow-2xl">
      <span className="text-sm font-medium">{user.credits === 0 ? "Credits are running low! All credits used" : `Credits are running low: ${fmt(user.credits)} left`}</span>
      <Link href="/pricing" className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-black">
        Upgrade
      </Link>
      <button onClick={() => setHiddenAt(user.credits)} aria-label="Dismiss" className="px-1 text-mute hover:text-white">
        ✕
      </button>
    </div>
  );
}
