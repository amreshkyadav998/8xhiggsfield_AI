// Mocked generation returns real stock media that matches the prompt.
// Library is built by scripts/build-media.mjs (Unsplash free photos + Mixkit free videos).
import LIB from "./media.json";
import type { Kind, Ratio } from "./catalog";

export interface Photo {
  type: "photo";
  src: string;
  alt: string;
  color: string;
  by: string;
  link: string;
}
export interface Clip {
  type: "video";
  src: string;
  hd: string;
  poster: string;
  link: string;
}
export type MediaItem = Photo | Clip;

type Topic = { id: string; keys: string[]; photos: Omit<Photo, "type">[]; videos: Omit<Clip, "type">[] };
const TOPICS = LIB as Topic[];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Topics ranked by how many prompt words hit their keywords; falls back to a stable pick. */
export function topicsFor(prompt: string): Topic[] {
  const words = prompt.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const scored = TOPICS.map((t) => ({ t, s: words.reduce((n, w) => n + (t.keys.includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.t);
  return scored.length ? scored : [TOPICS[hash(prompt) % TOPICS.length]];
}

/** The i-th distinct output for a prompt. Same prompt + seed always returns the same media. */
export function pick(prompt: string, kind: Kind, seed: number): MediaItem {
  const top = topicsFor(prompt);
  // Mostly the best topic, with the runner-up mixed in for variety.
  const topic = top.length > 1 && seed % 3 === 2 ? top[1] : top[0];
  if (kind === "video") {
    const v = topic.videos[(hash(prompt) + seed) % topic.videos.length];
    return { type: "video", ...v };
  }
  const p = topic.photos[(hash(prompt) + seed) % topic.photos.length];
  return { type: "photo", ...p };
}

/** Distinct seeds for a multi-output job, so 4 images aren't the same photo. */
export const seedsFor = (n: number) => {
  const base = Math.floor(Math.random() * 1e6);
  return Array.from({ length: n }, (_, i) => base + i);
};

export function photoUrl(src: string, ratio: Ratio | "3:4" | "16:10", width = 800) {
  const [w, h] = ratio.split(":").map(Number);
  const height = Math.round((width * h) / w);
  return `${src}?w=${width}&h=${height}&fit=crop&crop=entropy&auto=format&q=72`;
}

// Genjutsu looks: a CSS filter applied to the user's own clip as the restyle preview.
export const STYLE_FILTERS: Record<string, string> = {
  Anime: "saturate(1.7) contrast(1.15) brightness(1.05)",
  Claymation: "saturate(1.35) contrast(0.9) blur(0.4px)",
  Watercolor: "saturate(0.75) brightness(1.12) contrast(0.85)",
  "Comic Book": "contrast(1.7) saturate(1.8)",
  "Pixel Art": "saturate(1.5) contrast(1.3) hue-rotate(10deg)",
  Noir: "grayscale(1) contrast(1.45)",
  Cyberpunk: "hue-rotate(250deg) saturate(1.9) contrast(1.2)",
  "Oil Paint": "saturate(1.35) contrast(1.1) sepia(0.25)",
  "Ukiyo-e": "sepia(0.55) saturate(1.25) contrast(1.1)",
  "Low Poly": "contrast(1.35) saturate(0.9) brightness(1.05)",
  Sketch: "grayscale(1) contrast(2.1) brightness(1.25)",
  Vaporwave: "hue-rotate(290deg) saturate(1.7)",
  "Paper Cut": "contrast(1.45) saturate(1.2) brightness(1.05)",
  "Neon Glow": "hue-rotate(160deg) saturate(2.1) contrast(1.3)",
  "Retro VHS": "sepia(0.4) saturate(1.5) hue-rotate(-15deg) contrast(1.1)",
  "Stop Motion": "saturate(1.2) contrast(1.05) sepia(0.15)",
  Blueprint: "grayscale(1) sepia(1) hue-rotate(180deg) saturate(3)",
  "Pop Art": "saturate(2.6) contrast(1.5)",
};

/** A specific library item by topic, for curated showcase tiles. */
export function byTopic(topicId: string, i: number, kind: "image" | "video"): MediaItem {
  const t = TOPICS.find((x) => x.id === topicId) ?? TOPICS[0];
  if (kind === "video") return { type: "video", ...t.videos[i % t.videos.length] };
  return { type: "photo", ...t.photos[i % t.photos.length] };
}
