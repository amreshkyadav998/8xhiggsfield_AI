// Little lime agent mascots for the MCP section. Pure SVG, one per agent.
const SHAPES = {
  director: "M20 44c-9 0-14-7-11-14 2-5 7-6 9-10 3-6 13-8 17-1 4-1 10 1 11 7 6 2 8 9 3 14-3 4-9 4-12 3-4 2-12 2-17 1z",
  creator: "M32 6l7 14 15 3-11 11 3 16-14-8-14 8 3-16L10 23l15-3z",
  lead: "M32 8c13 0 22 10 22 23S45 56 32 56 10 44 10 31 19 8 32 8z",
  designer: "M32 10c10 0 20 14 22 26 2 11-6 18-22 18S8 47 10 36c2-12 12-26 22-26z",
} as const;

export default function Dot({ kind, size = 72 }: { kind: keyof typeof SHAPES; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="drop-shadow-[0_8px_20px_rgba(209,254,23,.35)]">
      <path d={SHAPES[kind]} fill="#d1fe17" />
      {kind === "director" ? (
        <g fill="#111">
          <rect x="19" y="26" width="11" height="7" rx="3" />
          <rect x="34" y="26" width="11" height="7" rx="3" />
          <rect x="29" y="28" width="6" height="2" />
        </g>
      ) : kind === "designer" ? (
        <g fill="none" stroke="#111" strokeWidth="2.5">
          <circle cx="25" cy="32" r="5" />
          <circle cx="39" cy="32" r="5" />
          <path d="M30 32h4" />
        </g>
      ) : (
        <g fill="#111">
          <ellipse cx="27" cy="30" rx="2.6" ry="4" />
          <ellipse cx="37" cy="30" rx="2.6" ry="4" />
        </g>
      )}
      {kind === "lead" && <path d="M14 30a18 18 0 0136 0" fill="none" stroke="#111" strokeWidth="3" />}
    </svg>
  );
}
