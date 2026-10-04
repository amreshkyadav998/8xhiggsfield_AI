"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Kind } from "@/lib/catalog";
import { markKey, useApp, type Job } from "@/lib/store";
import FilterMenu, { NO_FILTERS, inDateRange, type Filters } from "@/components/studio/FilterMenu";
import Feed, { type Item } from "@/components/studio/Feed";

export type RightTab = "history" | "how";

/** Opens on History once the store has loaded and there is something to show, otherwise How it works. */
export function useRightTab(kind: Kind) {
  const { ready, jobs } = useApp();
  const [picked, setPicked] = useState<RightTab | null>(null);
  const value: RightTab = picked ?? (ready && jobs.some((j) => j.kind === kind) ? "history" : "how");
  return { value, set: setPicked };
}

/**
 * Two-pane tool layout: controls on the left (tabs + scrolling body + pinned Generate),
 * History / How it works on the right. Stacks on small screens with Generate kept in reach.
 */
export default function ToolShell({
  kind,
  tabs,
  tab,
  onTab,
  body,
  footer,
  how,
  right,
  onRight,
  onReuse,
}: {
  kind: Kind;
  tabs: { id: string; label: string }[];
  tab: string;
  onTab: (id: string) => void;
  body: React.ReactNode;
  footer: React.ReactNode;
  how: React.ReactNode;
  right: RightTab;
  onRight: (t: RightTab) => void;
  onReuse: (j: Job) => void;
}) {
  const { jobs, marks } = useApp();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const pane = useRef<HTMLElement>(null);
  const [w, setW] = useState(900);

  useEffect(() => {
    const el = pane.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const items: Item[] = useMemo(
    () =>
      jobs
        .filter((j) => j.kind === kind)
        .filter((j) => !filters.models.length || filters.models.includes(j.modelId))
        .filter((j) => inDateRange(filters, j.startedAt))
        .filter((j) => !(filters.hideFailed && j.canceled))
        .flatMap((j) => (j.canceled ? [{ job: j, seed: j.seeds[0] }] : j.seeds.map((seed) => ({ job: j, seed }))))
        .filter(({ job, seed }) => (!filters.liked || marks[markKey(job, seed)]?.liked) && (!filters.downloaded || marks[markKey(job, seed)]?.downloaded)),
    [jobs, kind, filters, marks]
  );
  const cols = kind === "audio" ? (w < 560 ? 1 : w < 1000 ? 2 : 3) : w < 520 ? 2 : w < 900 ? 3 : 4;
  const seg = (on: boolean) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${on ? "bg-white/10 text-white" : "text-mute hover:text-white"}`;

  return (
    <div className="mx-auto flex max-w-[1800px] gap-4 p-3 md:p-4 max-lg:flex-col">
      <aside className="flex shrink-0 flex-col rounded-3xl border border-line bg-panel lg:sticky lg:top-[76px] lg:h-[calc(100vh-92px)] lg:w-[420px]">
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTab(t.id)}
              className={`shrink-0 border-b-2 px-3 pb-3 pt-2 text-[15px] font-semibold transition-colors ${tab === t.id ? "border-white text-white" : "border-transparent text-mute hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-3 p-3 lg:overflow-y-auto">{body}</div>
        <div className="rounded-b-3xl border-t border-line bg-panel p-3 max-lg:sticky max-lg:bottom-0 max-lg:z-20">{footer}</div>
      </aside>

      <section ref={pane} id="tool-results" className="min-w-0 flex-1 scroll-mt-20 rounded-3xl border border-line bg-[#0d0d10] p-3 md:p-4 lg:min-h-[calc(100vh-92px)]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex gap-1 rounded-2xl border border-line bg-black/30 p-1">
            <button onClick={() => onRight("history")} className={seg(right === "history")}>
              ▭ History
              {jobs.some((j) => j.kind === kind) && <span className="rounded-full bg-white/10 px-1.5 text-xs">{jobs.filter((j) => j.kind === kind).length}</span>}
            </button>
            <button onClick={() => onRight("how")} className={seg(right === "how")}>
              ▯ How it works
            </button>
          </div>
          {right === "history" && <FilterMenu kind={kind} value={filters} onChange={setFilters} />}
        </div>
        {right === "how" ? (
          how
        ) : items.length ? (
          <Feed items={items} cols={cols} onReuse={onReuse} />
        ) : (
          <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-line p-6 text-center text-mute">
            <div>
              <p>{jobs.some((j) => j.kind === kind) ? "Nothing matches these filters." : `Your ${kind} generations will appear here.`}</p>
              <button onClick={() => (jobs.some((j) => j.kind === kind) ? setFilters(NO_FILTERS) : onRight("how"))} className="mt-2 text-accent underline">
                {jobs.some((j) => j.kind === kind) ? "Clear filters" : "See how it works"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
