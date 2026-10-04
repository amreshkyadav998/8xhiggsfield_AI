"use client";
import Link from "next/link";
import { fmt } from "@/lib/catalog";

export default function GenerateButton({
  ready,
  signedIn,
  cost,
  disabled,
  onClick,
  next,
  label = "Generate",
}: {
  ready: boolean;
  signedIn: boolean;
  cost: number;
  disabled: boolean;
  onClick: () => void;
  next: string;
  label?: string;
}) {
  if (ready && !signedIn)
    return (
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="block rounded-xl bg-accent py-3 text-center font-semibold text-black">
        Sign in to {label.toLowerCase()} · {fmt(cost)} credits
      </Link>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-accent py-3 font-semibold text-black enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label} · {fmt(cost)} credits
    </button>
  );
}
