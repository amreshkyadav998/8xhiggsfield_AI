export type Kind = "image" | "video" | "audio";

export interface Model {
  id: string;
  name: string;
  kind: Kind;
  blurb: string;
  cost: number; // list credits per image, per second of video, or per audio clip
  seconds: number; // simulated render time
  durations?: number[];
  tag?: string;
  mark: string; // short glyph for the model picker
}

export const MODELS: Model[] = [
  { id: "soul", name: "Soul 2.0", kind: "image", blurb: "Photoreal portraits and fashion", cost: 1.5, seconds: 5, mark: "S" },
  { id: "soul-cinema", name: "Soul Cinema", kind: "image", blurb: "Film-grade stills with cinematic light", cost: 2, seconds: 6, tag: "NEW", mark: "SC" },
  { id: "gpt-image", name: "GPT Image 2", kind: "image", blurb: "Near-perfect text rendering", cost: 2, seconds: 7, mark: "G" },
  { id: "nano", name: "Nano Pro", kind: "image", blurb: "Fast drafts, great for iterating", cost: 1, seconds: 3, tag: "FAST", mark: "N" },
  { id: "flux", name: "Flux 2", kind: "image", blurb: "Crisp detail, strong prompt adherence", cost: 1.5, seconds: 5, mark: "F" },
  { id: "seedream", name: "Seedream 5", kind: "image", blurb: "Vivid color and stylized looks", cost: 1, seconds: 4, mark: "SD" },
  { id: "seed", name: "Seedance 2.5", kind: "video", blurb: "Cinematic motion, 5-10s clips", cost: 3, seconds: 12, durations: [5, 8, 10], tag: "TOP", mark: "SE" },
  { id: "kling", name: "Kinetic 3.0", kind: "video", blurb: "Smooth camera moves", cost: 2, seconds: 9, durations: [5, 8], mark: "K" },
  { id: "veo", name: "Veo 3.1", kind: "video", blurb: "Realistic physics, native sound", cost: 4, seconds: 14, durations: [4, 8], mark: "V" },
  { id: "sora", name: "Sora 2", kind: "video", blurb: "Long, coherent scenes", cost: 4, seconds: 15, durations: [5, 10], mark: "SO" },
  { id: "wan", name: "WAN 2.6", kind: "video", blurb: "Budget-friendly motion", cost: 1, seconds: 8, durations: [5], mark: "W" },
  { id: "voice", name: "Voiceover", kind: "audio", blurb: "Natural narration from a script", cost: 2, seconds: 4, mark: "VO" },
  { id: "score", name: "Score", kind: "audio", blurb: "Original background music", cost: 3, seconds: 7, mark: "SC" },
];

export const QUALITIES = ["Standard", "High"] as const;
export type Quality = (typeof QUALITIES)[number];
export const IMAGE_RES = ["1K", "2K", "4K"] as const;
export const VIDEO_RES = ["720p", "1080p"] as const;
export type Res = (typeof IMAGE_RES)[number] | (typeof VIDEO_RES)[number];

/** Launch promo: every generation is billed at 75% of list. */
export const PROMO = 0.75;
const half = (x: number) => Math.max(0.5, Math.round(x * 2) / 2);

/** Single source of truth for pricing. `charge` is what the button shows and what the store deducts. */
export function price(m: Model, o: { seconds?: number; count?: number; quality?: Quality; res?: Res } = {}) {
  const base = m.kind === "video" ? m.cost * (o.seconds ?? 5) : m.cost * (o.count ?? 1);
  const q = o.quality === "High" ? 1.5 : 1;
  const r = o.res === "2K" || o.res === "1080p" ? 1.3 : o.res === "4K" ? 2 : 1;
  const list = half(base * q * r);
  return { list, charge: half(list * PROMO) };
}

export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export const GENJUTSU_STYLES = [
  "Anime", "Claymation", "Watercolor", "Comic Book", "Pixel Art", "Noir", "Cyberpunk", "Oil Paint", "Ukiyo-e",
  "Low Poly", "Sketch", "Vaporwave", "Paper Cut", "Neon Glow", "Retro VHS", "Stop Motion", "Blueprint", "Pop Art",
];

export const INFLUENCER_STYLES = ["Retro", "Sporty", "Y2K", "Theatrical", "Goth", "Clowncore", "Casual"];

export const RATIOS = ["1:1", "16:9", "9:16", "4:5", "3:4"] as const;
export type Ratio = (typeof RATIOS)[number];

export const ratioBox = (r: Ratio) => {
  const [w, h] = r.split(":").map(Number);
  return { w, h, css: `${w} / ${h}` };
};

export interface Effect {
  id: string;
  name: string;
  kind: Kind;
  prompt: string;
  hue: number;
  tag: string;
}

export const EFFECTS: Effect[] = [
  { id: "melt", name: "Melt Down", kind: "video", tag: "VFX", hue: 18, prompt: "the subject slowly melts into liquid gold, macro lens, studio light" },
  { id: "float", name: "Zero Gravity", kind: "video", tag: "VFX", hue: 210, prompt: "everything in the room floats weightless, slow drifting camera" },
  { id: "dolly", name: "Hero Dolly", kind: "video", tag: "Camera", hue: 340, prompt: "dramatic dolly zoom on a lone figure, neon rain, anamorphic flares" },
  { id: "restyle", name: "Anime Restyle", kind: "video", tag: "Restyle", hue: 280, prompt: "restyle the footage as hand-painted anime, bold ink lines, soft clouds" },
  { id: "editorial", name: "Editorial Portrait", kind: "image", tag: "Portrait", hue: 40, prompt: "editorial fashion portrait, hard flash, grainy film, deep shadows" },
  { id: "product", name: "Product Hero", kind: "image", tag: "Commerce", hue: 160, prompt: "luxury product on wet black stone, rim light, floating droplets" },
  { id: "tryon", name: "Wardrobe Swap", kind: "image", tag: "Fashion", hue: 320, prompt: "same person wearing a tailored emerald trench coat, street at dusk" },
  { id: "world", name: "Tiny World", kind: "image", tag: "Style", hue: 120, prompt: "a miniature city inside a glass jar, tilt-shift, morning fog" },
];

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  perks: string[];
}

export const PLANS: Plan[] = [
  { id: "free", name: "Free", price: 0, credits: 50, perks: ["50 starter credits", "Nano Pro + Soul", "Watermarked video"] },
  { id: "pro", name: "Pro", price: 29, credits: 600, perks: ["600 credits / month", "All models", "No watermark", "Priority queue"] },
  { id: "studio", name: "Studio", price: 79, credits: 2000, perks: ["2,000 credits / month", "Commercial license", "4 parallel jobs", "Team seats"] },
];
