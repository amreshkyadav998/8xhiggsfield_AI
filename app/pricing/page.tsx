"use client";
import Link from "next/link";
import { PLANS } from "@/lib/catalog";
import { useApp } from "@/lib/store";

export default function Pricing() {
  const { user, setPlan, topUp } = useApp();
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold">
        Launch offer: 50% off your first month on every paid plan
      </div>
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-1 text-mute">Credits pay for generations. Demo only: choosing a plan adds credits instantly and charges nothing.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = user?.plan === p.id;
          return (
            <div key={p.id} className={`flex flex-col rounded-2xl border bg-panel p-6 ${p.id === "pro" ? "border-accent" : "border-line"}`}>
              <h2 className="font-semibold">{p.name}</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold">${p.price / (p.price ? 2 : 1)}</span>
                {p.price > 0 && <span className="text-mute line-through">${p.price}</span>}
                <span className="text-sm text-mute">/mo</span>
              </div>
              <ul className="my-5 flex-1 space-y-2 text-sm text-mute">
                {p.perks.map((k) => (
                  <li key={k}>✓ {k}</li>
                ))}
              </ul>
              {!user ? (
                <Link href="/login?next=/pricing" className="rounded-lg border border-line py-2 text-center text-sm hover:border-white">
                  Sign in to choose
                </Link>
              ) : current ? (
                <div className="rounded-lg bg-black/40 py-2 text-center text-sm text-mute">Current plan</div>
              ) : (
                <button onClick={() => setPlan(p.id, p.credits)} className="rounded-lg bg-accent py-2 text-sm font-semibold text-black hover:brightness-95">
                  Switch to {p.name}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {user && (
        <div className="mt-8 flex items-center justify-between rounded-xl border border-line bg-panel p-5">
          <div>
            <div className="font-medium">Top up credits</div>
            <div className="text-sm text-mute">Balance: {user.credits} credits</div>
          </div>
          <div className="flex gap-2">
            {[50, 200, 1000].map((n) => (
              <button key={n} onClick={() => topUp(n)} className="rounded-lg border border-line px-4 py-2 text-sm hover:border-accent">
                +{n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
