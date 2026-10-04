"use client";
import { useState } from "react";

const DAY = 864e5;
const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime();

/** Month grid with click-to-pick range: first click sets start, second sets end. */
export default function Calendar({ from, to, onChange }: { from?: number; to?: number; onChange: (from: number, to: number) => void }) {
  const [view, setView] = useState(() => {
    const d = new Date(from ?? Date.now());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [anchor, setAnchor] = useState<number | null>(null);
  const [today] = useState(() => startOfDay(Date.now()));

  const first = new Date(view);
  const gridStart = first.getTime() - first.getDay() * DAY;
  const days = Array.from({ length: 42 }, (_, i) => startOfDay(gridStart + i * DAY + DAY / 2));
  const lo = anchor ?? from;
  const hi = anchor ? undefined : to;

  const pick = (d: number) => {
    if (anchor === null) {
      setAnchor(d);
      onChange(d, d + DAY - 1);
    } else {
      const [a, b] = d < anchor ? [d, anchor] : [anchor, d];
      setAnchor(null);
      onChange(a, b + DAY - 1);
    }
  };
  const shift = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));

  return (
    <div className="mx-auto w-full max-w-72">
      <div className="mb-2 flex items-center justify-between rounded-xl border border-line px-2 py-1.5">
        <button onClick={() => shift(-1)} className="px-2 text-mute hover:text-white" aria-label="Previous month">
          ‹
        </button>
        <span className="text-sm font-medium">{view.toLocaleString("en", { month: "long", year: "numeric" })}</span>
        <button onClick={() => shift(1)} className="px-2 text-mute hover:text-white" aria-label="Next month">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-mute">
        {"SMTWTFS".split("").map((d, i) => (
          <div key={i} className="py-1.5">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const inMonth = new Date(d).getMonth() === view.getMonth();
          const sel = lo !== undefined && (hi !== undefined ? d >= startOfDay(lo) && d <= hi : d === startOfDay(lo));
          return (
            <button
              key={d}
              onClick={() => pick(d)}
              disabled={d > today}
              className={`m-0.5 rounded-lg py-1.5 text-sm transition-colors disabled:opacity-25 ${sel ? "bg-accent font-semibold text-black" : d === today ? "bg-white/15 text-white" : inMonth ? "text-white hover:bg-white/10" : "text-white/30 hover:bg-white/5"}`}
            >
              {new Date(d).getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-mute">{anchor ? "Pick an end date" : "Pick a start date"}</p>
    </div>
  );
}
