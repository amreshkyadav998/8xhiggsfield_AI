export type Kind = "image" | "video" | "audio";

export interface Model {
  id: string;
  name: string;
  kind: Kind;
  blurb: string;
  cost: number; // credits (per image, or per second of video)
  seconds: number; // simulated render time
  durations?: number[];
}

export const MODELS: Model[] = [
  { id: "soul", name: "Soul", kind: "image", blurb: "Photoreal portraits and fashion", cost: 2, seconds: 5 },
  { id: "nano", name: "Nano Pro", kind: "image", blurb: "Fast drafts, great for iterating", cost: 1, seconds: 3 },
  { id: "seed", name: "Seedance", kind: "video", blurb: "Cinematic motion, 5-10s clips", cost: 3, seconds: 12, durations: [5, 8, 10] },
  { id: "kling", name: "Kinetic", kind: "video", blurb: "Smooth camera moves", cost: 2, seconds: 9, durations: [5, 8] },
  { id: "voice", name: "Voiceover", kind: "audio", blurb: "Natural narration from a script", cost: 2, seconds: 4 },
  { id: "score", name: "Score", kind: "audio", blurb: "Original background music", cost: 3, seconds: 7 },
];

export const GENJUTSU_STYLES = [
  "Anime", "Claymation", "Watercolor", "Comic Book", "Pixel Art", "Noir", "Cyberpunk", "Oil Paint", "Ukiyo-e",
  "Low Poly", "Sketch", "Vaporwave", "Paper Cut", "Neon Glow", "Retro VHS", "Stop Motion", "Blueprint", "Pop Art",
];

export const INFLUENCER_STYLES = ["Retro", "Sporty", "Y2K", "Theatrical", "Goth", "Clowncore", "Casual"];

export const RATIOS = ["1:1", "16:9", "9:16", "4:5"] as const;
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

export const estimate = (m: Model, seconds = 1, count = 1) =>
  m.kind === "video" ? m.cost * seconds : m.cost * count;
