"use client";
import { useState } from "react";

export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-black">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-mute">
        <span>{label}</span>
        <button onClick={copy} className="hover:text-white">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}
