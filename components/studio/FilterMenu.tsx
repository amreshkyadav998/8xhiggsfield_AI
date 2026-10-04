"use client";
import { useState } from "react";
import { MODELS, type Kind } from "@/lib/catalog";
import Dropdown, { rowCls } from "./Dropdown";
import Calendar from "./Calendar";

export interface Filters {
  models: string[]; // empty = all
  date: "all" | "today" | "7" | "30" | "custom";
  from?: number;
  to?: number;
  hideFailed: boolean;
  liked: boolean;
  downloaded: boolean;
}
export const NO_FILTERS: Filters = { models: [], date: "all", hideFailed: false, liked: false, downloaded: false };

export const activeCount = (f: Filters) => (f.models.length ? 1 : 0) + (f.date !== "all" ? 1 : 0) + +f.hideFailed + +f.liked + +f.downloaded;

export function inDateRange(f: Filters, t: number) {
  const day = 864e5;
  const today = new Date(new Date().toDateString()).getTime();
  switch (f.date) {
    case "today":
      return t >= today;
    case "7":
      return t >= today - 6 * day;
    case "30":
      return t >= today - 29 * day;
    case "custom":
      return t >= (f.from ?? 0) && t <= (f.to ?? Infinity);
    default:
      return true;
  }
}

const Chevron = () => <span className="ml-auto text-mute">›</span>;
const Check = ({ on }: { on: boolean }) => (
  <span className={`ml-auto grid h-5 w-5 place-items-center rounded-md border text-xs ${on ? "border-accent bg-accent text-black" : "border-white/20"}`}>{on ? "✓" : ""}</span>
);

export default function FilterMenu({ kind, value, onChange }: { kind: Kind; value: Filters; onChange: (f: Filters) => void }) {
  const [sub, setSub] = useState<null | "models" | "date">(null);
  const [q, setQ] = useState("");
  const models = MODELS.filter((m) => m.kind === kind && m.name.toLowerCase().includes(q.toLowerCase()));
  const set = (p: Partial<Filters>) => onChange({ ...value, ...p });
  const toggleModel = (id: string) => set({ models: value.models.includes(id) ? value.models.filter((x) => x !== id) : [...value.models, id] });
  const n = activeCount(value);

  return (
    <Dropdown
      side="bottom"
      align="right"
      className="w-80"
      trigger={(open, toggle) => (
        <button onClick={toggle} aria-label="Filter results" className={`relative grid h-11 w-11 place-items-center rounded-xl border border-line text-lg ${open ? "bg-white/10" : "bg-[#141417] hover:bg-white/5"}`}>
          ☰
          {n > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-black">{n}</span>}
        </button>
      )}
    >
      {() => (
        <div className="relative">
          <div className="px-3 pb-1 pt-2 text-sm text-mute">Type</div>
          <button className={rowCls(sub === "models")} onClick={() => setSub(sub === "models" ? null : "models")}>
            ✧ {value.models.length ? `${value.models.length} model${value.models.length > 1 ? "s" : ""}` : "All models"} <Chevron />
          </button>
          <button className={rowCls(sub === "date")} onClick={() => setSub(sub === "date" ? null : "date")}>
            ▦ {{ all: "Date range", today: "Today", "7": "Last 7 days", "30": "Last 30 days", custom: "Custom range" }[value.date]} <Chevron />
          </button>
          <button className={rowCls()} onClick={() => set({ hideFailed: !value.hideFailed })} role="switch" aria-checked={value.hideFailed}>
            ⊘ Hide failed
            <span className={`ml-auto flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${value.hideFailed ? "bg-accent" : "bg-white/15"}`}>
              <span className={`h-5 w-5 rounded-full bg-white transition-transform ${value.hideFailed ? "translate-x-5" : ""}`} />
            </span>
          </button>
          <div className="mx-3 my-2 border-t border-line" />
          <div className="px-3 pb-1 text-sm text-mute">Activity</div>
          <button className={rowCls(value.liked)} onClick={() => set({ liked: !value.liked })}>
            ♡ Liked <Check on={value.liked} />
          </button>
          <button className={rowCls(value.downloaded)} onClick={() => set({ downloaded: !value.downloaded })}>
            ⤓ Downloaded <Check on={value.downloaded} />
          </button>
          {n > 0 && (
            <button onClick={() => onChange(NO_FILTERS)} className="mt-1 w-full rounded-xl py-2 text-sm text-mute hover:text-white">
              Clear all filters
            </button>
          )}

          {sub === "models" && (
            <div className="absolute right-full top-0 mr-4 w-80 rounded-2xl border border-line bg-[#141417] p-2 shadow-2xl max-sm:static max-sm:mr-0 max-sm:mt-2 max-sm:w-full max-sm:shadow-none">
              <div className="px-3 pb-2 pt-2 text-sm text-mute">Models</div>
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" className="mb-2 w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none focus:bg-white/10" />
              <button className={rowCls()} onClick={() => set({ models: [] })}>
                All models {value.models.length === 0 && <span className="ml-auto">✓</span>}
              </button>
              {models.map((m) => (
                <button key={m.id} className={rowCls()} onClick={() => toggleModel(m.id)}>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-[10px] font-bold">{m.mark}</span>
                  {m.name}
                  <Check on={value.models.includes(m.id)} />
                </button>
              ))}
              {models.length === 0 && <p className="px-3 py-4 text-sm text-mute">No models match “{q}”.</p>}
            </div>
          )}
          {sub === "date" && (
            <div className="absolute right-full top-0 mr-4 rounded-2xl border border-line bg-[#141417] p-3 shadow-2xl max-sm:static max-sm:mr-0 max-sm:mt-2 max-sm:w-full max-sm:shadow-none">
              <div className="px-2 pb-1 text-sm text-mute">Date</div>
              {(
                [
                  ["all", "All period"],
                  ["today", "Today"],
                  ["7", "Last 7 days"],
                  ["30", "Last 30 days"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} className={rowCls()} onClick={() => set({ date: k })}>
                  {l} {value.date === k && <span className="ml-auto">✓</span>}
                </button>
              ))}
              <div className="mx-2 my-2 border-t border-line" />
              <div className="px-2 pb-2 text-sm text-mute">Custom range</div>
              <Calendar from={value.from} to={value.to} onChange={(from, to) => set({ date: "custom", from, to })} />
            </div>
          )}
        </div>
      )}
    </Dropdown>
  );
}
