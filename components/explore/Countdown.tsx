"use client";
import { useEffect, useState } from "react";

const KEY = "hf.offerEnds";
const WINDOW = (2 * 60 + 5) * 60 * 1000;

/** A personal offer timer that survives reloads and restarts when it runs out. */
export default function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    let end = 0;
    try {
      end = Number(localStorage.getItem(KEY)) || 0;
    } catch {}
    if (end < Date.now()) {
      end = Date.now() + WINDOW;
      try {
        localStorage.setItem(KEY, String(end));
      } catch {}
    }
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return <span className="invisible">Discount expires in 0h 00m 00s</span>;
  const s = Math.floor(left / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span>
      Discount expires in {Math.floor(s / 3600)}h {pad(Math.floor((s % 3600) / 60))}m {pad(s % 60)}s
    </span>
  );
}
