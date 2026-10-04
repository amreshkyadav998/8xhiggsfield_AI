// Curated Explore content. Every tile is real library media; clicking it opens the tool with the prompt.
import type { Kind } from "./catalog";

export interface Tile {
  topic: string;
  i: number;
  kind: "image" | "video";
  prompt: string;
  tall?: boolean;
  wide?: boolean;
  style?: string; // Genjutsu look applied to the clip
  model?: string;
}

const v = (topic: string, i: number, prompt: string, extra: Partial<Tile> = {}): Tile => ({ topic, i, kind: "video", prompt, ...extra });
const p = (topic: string, i: number, prompt: string, extra: Partial<Tile> = {}): Tile => ({ topic, i, kind: "image", prompt, ...extra });

export const VFX: Tile[] = [
  v("smoke", 0, "colored smoke erupts around the subject, slow motion, studio black", { tall: true }),
  v("fire", 1, "a wall of fire ignites behind the hero, embers drift to camera"),
  v("car", 0, "car drifts through thick smoke, low angle tracking shot", { tall: true }),
  v("space", 2, "the room loses gravity, everything floats upward"),
  v("neon", 3, "neon signs flicker as the street melts into rain", { tall: true }),
  v("ocean", 1, "a tidal wave freezes mid-air, camera flies through it"),
  v("dance", 2, "dancer leaves light trails with every move, long exposure look", { tall: true }),
  v("fire", 4, "sparks shower down in slow motion over a lone figure"),
  v("smoke", 3, "ink blooms in water and forms a face"),
  v("snow", 1, "snowstorm swirls into a vortex around the camera", { tall: true }),
];

export const GENJUTSU_SHOWCASE: Tile[] = [
  v("dance", 0, "Restyle as Anime", { style: "Anime" }),
  v("man", 1, "Restyle as Noir", { style: "Noir", tall: true }),
  v("architecture", 2, "Restyle as Blueprint", { style: "Blueprint" }),
  v("forest", 0, "Restyle as Watercolor", { style: "Watercolor", tall: true }),
  v("neon", 5, "Restyle as Cyberpunk", { style: "Cyberpunk" }),
  v("portrait", 2, "Restyle as Pop Art", { style: "Pop Art", tall: true }),
  v("car", 3, "Restyle as Retro VHS", { style: "Retro VHS" }),
  v("sport", 1, "Restyle as Comic Book", { style: "Comic Book" }),
  v("fashion", 2, "Restyle as Vaporwave", { style: "Vaporwave", tall: true }),
  v("sunset", 0, "Restyle as Oil Paint", { style: "Oil Paint" }),
];

export const SEEDANCE: Tile[] = [
  v("portrait", 0, "woman in lilac knit sits on a cloud of pink haze, slow push in", { tall: true, model: "seed" }),
  v("car", 1, "red race car drifts through blue smoke, aerial orbit", { model: "seed" }),
  v("portrait", 3, "close-up, a single tear, warm backlight, 85mm", { model: "seed" }),
  v("coffee", 0, "morning coffee pour in a sunlit kitchen, macro", { model: "seed" }),
  v("man", 2, "man walks through a crowded subway, handheld", { tall: true, model: "seed" }),
  v("fashion", 0, "editorial runway walk, strobe flashes, slow motion", { model: "seed" }),
  v("ocean", 3, "surfer carves a glassy wave at golden hour", { model: "seed" }),
  v("mountain", 1, "drone rises over a misty ridge at dawn", { tall: true, model: "seed" }),
];

export const SOUL: Tile[] = [
  p("portrait", 1, "editorial portrait, hard flash, film grain", { tall: true, model: "soul" }),
  p("fashion", 3, "street style, tailored coat, city at dusk", { model: "soul" }),
  p("product", 2, "luxury bottle on wet black stone, rim light", { model: "soul" }),
  p("architecture", 1, "brutalist stairs, single figure, high noon", { tall: true, model: "soul" }),
  p("flowers", 4, "macro petals, morning dew, pastel palette", { model: "soul" }),
  p("man", 4, "moody male portrait, side light, deep shadows", { tall: true, model: "soul" }),
  p("desert", 2, "lone traveler on endless dunes, wide shot", { model: "soul" }),
  p("animals", 3, "fox portrait in snow, soft light", { model: "soul" }),
];

export const MARKETING: Tile[] = [
  v("product", 0, "15s product ad: hand reveals the bottle, splash of water", { tall: true }),
  v("coffee", 2, "UGC style: creator reviews her morning latte"),
  v("fashion", 4, "try-on haul, quick cuts, mirror shots", { tall: true }),
  v("sport", 3, "sneaker ad, runner hits the track at sunrise"),
  v("product", 4, "packshot spin on a seamless backdrop"),
  v("dance", 5, "TikTok trend: three dancers, one take", { tall: true }),
];

export interface Project {
  id: string;
  title: string;
  by: string;
  logline: string;
  shots: Tile[];
}

export const PROJECTS: Project[] = [
  {
    id: "last-train",
    title: "Last Train to Lumen",
    by: "mira.frames",
    logline: "A night commuter follows a light that only she can see.",
    shots: [p("neon", 1, "empty subway platform, neon haze, 2am"), v("neon", 2, "train doors open onto a glowing city"), v("rain", 1, "rain on the window, reflections of her face"), p("portrait", 5, "close-up, her eyes catch the light")],
  },
  {
    id: "salt-static",
    title: "Salt & Static",
    by: "deepfield",
    logline: "Two radio operators on opposite coasts fall for a voice.",
    shots: [p("ocean", 2, "lighthouse radio room, stormy sea outside"), v("ocean", 4, "waves crash against black rocks"), p("man", 3, "operator leans into the microphone"), v("sunset", 2, "golden hour over the water")],
  },
  {
    id: "quiet-engine",
    title: "The Quiet Engine",
    by: "atlas.studio",
    logline: "A retired racer rebuilds the car that nearly killed him.",
    shots: [p("car", 2, "vintage race car under a dusty tarp"), v("car", 5, "night drive, dashboard glow"), p("man", 0, "weathered hands on a steering wheel"), v("fire", 2, "engine bay sparks in a dark garage")],
  },
  {
    id: "paper-wolves",
    title: "Paper Wolves",
    by: "kit.and.ink",
    logline: "A child's drawings come alive in a winter forest.",
    shots: [p("snow", 2, "snowy forest at dusk, a small figure"), v("snow", 3, "snow falls through pine trees"), p("animals", 1, "wolf portrait, frost on fur"), v("forest", 3, "mist rolls between the trees")],
  },
  {
    id: "neon-saints",
    title: "Neon Saints",
    by: "ryo.motion",
    logline: "A street choir sings the city awake.",
    shots: [p("neon", 4, "alley lit in pink and teal"), v("dance", 1, "crowd moves as one under the lights"), p("fashion", 5, "choir in white robes, neon backdrop"), v("neon", 6, "time-lapse of traffic and signs")],
  },
  {
    id: "low-tide",
    title: "Low Tide",
    by: "sana.wav",
    logline: "Everything the sea gives back in one afternoon.",
    shots: [p("ocean", 5, "tide pools at golden hour"), v("ocean", 6, "foam slides over wet sand"), p("sunset", 3, "silhouette against an orange sky"), v("sunset", 4, "sun drops below the horizon")],
  },
  {
    id: "glass-garden",
    title: "Glass Garden",
    by: "verdant.co",
    logline: "A botanist grows a forest inside a greenhouse of mirrors.",
    shots: [p("flowers", 1, "greenhouse, glass panes, morning light"), v("flowers", 2, "flower opens in time-lapse"), p("architecture", 4, "mirror corridor full of plants"), v("forest", 5, "sunbeams through leaves")],
  },
  {
    id: "ember-run",
    title: "Ember Run",
    by: "northpaw",
    logline: "A trail runner races a wildfire down the mountain.",
    shots: [p("mountain", 3, "ridge line at sunset, smoke in the valley"), v("sport", 2, "runner on a dusty trail, tracking shot"), p("fire", 3, "embers glowing in the dark"), v("mountain", 5, "aerial over burnt hills")],
  },
];

export const FEATURE_CHIPS: { label: string; href: string }[] = [
  { label: "Text to Video", href: "/video" },
  { label: "Text to Image", href: "/image" },
  { label: "Visual Effects", href: "/#vfx" },
  { label: "Genjutsu Restyle", href: "/genjutsu" },
  { label: "AI Influencer", href: "/influencer" },
  { label: "Voiceover", href: "/audio" },
  { label: "Music Score", href: "/audio?model=score" },
  { label: "Seedance", href: "/video?model=seed" },
  { label: "Kinetic", href: "/video?model=kling" },
  { label: "Soul", href: "/image?model=soul" },
  { label: "Nano Pro", href: "/image?model=nano" },
  { label: "Claude MCP", href: "/mcp" },
  { label: "ChatGPT Dots", href: "/mcp#dots" },
  { label: "API", href: "/api-docs" },
  { label: "Projects", href: "/#projects" },
  { label: "Assets", href: "/assets" },
  { label: "Pricing", href: "/pricing" },
  { label: "Teams", href: "/enterprise" },
];

export const toolHref = (t: Tile, kind: Kind = t.kind) => {
  if (t.style) return "/genjutsu";
  const q = new URLSearchParams({ prompt: t.prompt });
  if (t.model) q.set("model", t.model);
  return `/${kind}?${q}`;
};
