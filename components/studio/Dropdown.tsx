"use client";
import { useEffect, useRef, useState } from "react";

/** Trigger + floating panel that closes on outside click or Escape. */
export default function Dropdown({
  trigger,
  children,
  side = "top",
  align = "left",
  className = "",
}: {
  trigger: (open: boolean, toggle: () => void) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  side?: "top" | "bottom";
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div
          className={`absolute z-50 rounded-2xl border border-line bg-[#141417] p-2 shadow-2xl ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"} ${align === "left" ? "left-0" : "right-0"} ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export const chipCls = (active = false) =>
  `flex h-12 items-center gap-2 rounded-xl border px-4 text-[15px] font-medium transition-colors ${active ? "border-white/30 bg-white/10" : "border-line bg-[#1a1a1e] hover:bg-[#222227]"}`;

export const rowCls = (active = false) =>
  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"}`;
