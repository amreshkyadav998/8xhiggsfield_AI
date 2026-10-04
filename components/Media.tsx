"use client";
import { useEffect, useRef, useState } from "react";
import { photoUrl, pick, type MediaItem } from "@/lib/media";
import type { Kind, Ratio } from "@/lib/catalog";

type R = Ratio | "3:4" | "16:10";

/** Renders a library item: a cropped photo, or a muted looping clip that only plays while on screen. */
export default function Media({
  item,
  ratio = "4:5",
  width = 800,
  hd = false,
  filter,
  className = "",
  controls = false,
}: {
  item: MediaItem;
  ratio?: R;
  width?: number;
  hd?: boolean;
  filter?: string;
  className?: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Derive the URL from props (not state) so a reused <Media> follows item changes;
  // only remember which HD URL failed so we can fall back to the 360p file.
  const [failedHd, setFailedHd] = useState<string | null>(null);
  const src = item.type === "video" ? (hd && failedHd !== item.hd ? item.hd : item.src) : "";

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  const style = { filter };
  if (item.type === "video")
    return (
      <video
        ref={ref}
        src={src}
        poster={item.poster}
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
        onError={() => item.type === "video" && src === item.hd && setFailedHd(item.hd)}
        className={`h-full w-full object-cover ${className}`}
        style={style}
      />
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(item.src, ratio, width)}
      alt={item.alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      style={{ ...style, backgroundColor: item.color }}
    />
  );
}

/** Convenience: media for a prompt without a job (tiles, thumbnails). */
export function PromptMedia({ prompt, kind = "image", seed = 0, ...rest }: { prompt: string; kind?: Kind; seed?: number } & Omit<Parameters<typeof Media>[0], "item">) {
  return <Media item={pick(prompt, kind, seed)} {...rest} />;
}
