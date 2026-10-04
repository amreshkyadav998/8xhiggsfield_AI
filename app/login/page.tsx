"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";

function Form() {
  const { signIn } = useApp();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/image";
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email");
    if (pw.length < 6) return setErr("Password needs at least 6 characters");
    signIn(email, mode === "signup" ? name : undefined);
    router.push(next);
  };

  const input = "w-full rounded-lg border border-line bg-black/40 p-3 text-sm outline-none focus:border-accent";
  return (
    <form onSubmit={submit} className="mx-4 mt-10 space-y-4 rounded-2xl border border-line bg-panel p-6 sm:mx-auto sm:mt-16 sm:w-full sm:max-w-sm">
      <h1 className="text-xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="text-xs text-mute">Demo: accounts live in this browser only. You get 50 free credits.</p>
      {mode === "signup" && <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />}
      <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <input className={input} type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
      {err && (
        <p role="alert" className="text-xs text-red-400">
          {err}
        </p>
      )}
      <button className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:brightness-95">{mode === "signup" ? "Sign up" : "Log in"}</button>
      <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="w-full text-xs text-mute hover:text-white">
        {mode === "signup" ? "Have an account? Log in" : "New here? Sign up"}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
