"use client";
import { useState } from "react";

const PERKS = [
  ["SSO and seats", "SAML, SCIM, roles, shared credit pools per team."],
  ["Brand safety", "Custom style guides, blocked terms, review before publish."],
  ["Volume pricing", "Committed-use discounts and invoicing."],
  ["Private models", "Fine-tune on your products and characters."],
];

export default function Enterprise() {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (!String(d.get("name")).trim()) return setErr("Add your name");
    if (!/^\S+@\S+\.\S+$/.test(String(d.get("email")))) return setErr("Enter a valid work email");
    setErr("");
    setSent(true);
  };
  const input = "w-full rounded-lg border border-line bg-black/40 p-3 text-sm outline-none focus:border-accent";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-black">Frameforge for teams</h1>
        <p className="mt-3 text-mute">Studios, agencies and brands producing video at scale.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PERKS.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-line bg-panel p-4">
              <div className="font-semibold">✦ {t}</div>
              <p className="mt-1 text-sm text-mute">{d}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-panel p-6">
        {sent ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="text-4xl">✓</div>
              <h2 className="mt-2 text-xl font-bold">Thanks, we&apos;ll be in touch</h2>
              <p className="mt-1 text-sm text-mute">Demo build: nothing was sent.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <h2 className="text-xl font-bold">Talk to sales</h2>
            <input name="name" className={input} placeholder="Full name" />
            <input name="email" type="email" className={input} placeholder="Work email" />
            <input name="company" className={input} placeholder="Company" />
            <select name="volume" className={input} defaultValue="">
              <option value="" disabled>
                Monthly video volume
              </option>
              <option>Under 100 clips</option>
              <option>100 to 1,000 clips</option>
              <option>1,000+ clips</option>
            </select>
            <textarea name="msg" rows={3} className={input} placeholder="What are you making?" />
            {err && (
              <p role="alert" className="text-xs text-red-400">
                {err}
              </p>
            )}
            <button className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:brightness-95">Contact sales</button>
          </form>
        )}
      </div>
    </div>
  );
}
