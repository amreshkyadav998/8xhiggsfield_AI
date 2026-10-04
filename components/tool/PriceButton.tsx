"use client";
import Link from "next/link";
import { fmt } from "@/lib/catalog";
import { useApp } from "@/lib/store";

/** Lime Generate button: discounted price next to the struck list price, sign-in and top-up states. */
export default function PriceButton({
  list,
  charge,
  disabled,
  reason,
  onClick,
  next,
  label = "Generate",
}: {
  list: number;
  charge: number;
  disabled?: boolean;
  reason?: string; // why it's disabled, shown under the button
  onClick: () => void;
  next: string;
  label?: string;
}) {
  const { user, ready } = useApp();
  if (ready && !user)
    return (
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-lg font-bold text-black shadow-[0_4px_0_#7a9400]">
        Sign in to {label.toLowerCase()} <span className="text-sm">· ✦ {fmt(charge)}</span>
      </Link>
    );
  const short = !!user && user.credits < charge;
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled || short}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-accent py-4 text-lg font-bold text-black shadow-[0_4px_0_#7a9400] transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
        <span className="flex items-center gap-1.5">
          ✦ {list !== charge && <s className="font-semibold opacity-50">{fmt(list)}</s>} {fmt(charge)}
        </span>
      </button>
      {short ? (
        <p className="mt-2 text-center text-xs text-mute">
          You have {fmt(user!.credits)} credits.{" "}
          <Link href="/pricing" className="text-accent underline">
            Get more
          </Link>
        </p>
      ) : (
        disabled && reason && <p className="mt-2 text-center text-xs text-mute">{reason}</p>
      )}
    </div>
  );
}
