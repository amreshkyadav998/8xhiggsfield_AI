// Creator Copilot mock data. Everything the UI shows comes from here, so a real analysis API
// only has to return the same shapes (see AnalysisTemplate) and lib/copilot.ts swaps the source.

export type CategoryId = "hook" | "brief" | "product" | "authenticity" | "pacing" | "cta";

export const CATEGORIES: { id: CategoryId; label: string; weight: number }[] = [
  { id: "hook", label: "Hook", weight: 0.2 },
  { id: "brief", label: "Brief Alignment", weight: 0.2 },
  { id: "product", label: "Product Demo", weight: 0.15 },
  { id: "authenticity", label: "Authenticity", weight: 0.1 },
  { id: "pacing", label: "Pacing", weight: 0.2 },
  { id: "cta", label: "CTA", weight: 0.15 },
];

export interface Brief {
  brand: string;
  audience: string;
  platform: string;
  goal: string;
  message: string;
  tone: string;
}

export const PLATFORMS = ["Instagram Reels", "TikTok", "YouTube Shorts", "YouTube", "LinkedIn"];
/** Expected aspect per platform, used by the "Correct format" check. */
export const PLATFORM_RATIO: Record<string, string> = {
  "Instagram Reels": "9:16",
  TikTok: "9:16",
  "YouTube Shorts": "9:16",
  YouTube: "16:9",
  LinkedIn: "1:1",
};
export const GOALS = ["Drive signups", "Build awareness", "Drive sales", "Grow followers"];
export const TONES = ["Authentic / Conversational", "Bold / Energetic", "Premium / Polished", "Educational", "Playful"];

export const EXAMPLE_BRIEFS: { id: string; label: string; template: string; brief: Brief }[] = [
  {
    id: "coding",
    label: "AI Coding Assistant",
    template: "coding",
    brief: {
      brand: "AI Coding Assistant",
      audience: "Developers aged 18–30",
      platform: "Instagram Reels",
      goal: "Drive signups",
      message: "AI coding assistant that speeds up development",
      tone: "Authentic / Conversational",
    },
  },
  {
    id: "fitness",
    label: "Fitness App",
    template: "fitness",
    brief: {
      brand: "Pulse Fitness App",
      audience: "Busy professionals aged 25–40",
      platform: "TikTok",
      goal: "Drive signups",
      message: "20-minute workouts that fit any schedule",
      tone: "Bold / Energetic",
    },
  },
  {
    id: "skincare",
    label: "Skincare Launch",
    template: "coding",
    brief: {
      brand: "Glow Serum",
      audience: "Women aged 20–35",
      platform: "Instagram Reels",
      goal: "Drive sales",
      message: "Visible glow in 7 days, dermatologist tested",
      tone: "Premium / Polished",
    },
  },
];

export interface Beat {
  label: string;
  start: number;
  end: number;
  kind: "hook" | "talk" | "benefit" | "demo" | "proof" | "cta";
}

export interface Explanation {
  why: string;
  evidence: string[];
  recommend?: { label: string; from?: string; to?: string };
  fixId?: string;
}

export interface Fix {
  id: string;
  title: string;
  detail: string;
  recommended: string;
  change: { from: string; to: string };
  severity: "critical" | "optional";
  effects: Partial<Record<CategoryId, number>>; // new scores once applied
}

export interface HookOption {
  id: string;
  text: string;
  score: number;
  why: string;
  effects: Partial<Record<CategoryId, number>>;
}

export interface AnalysisTemplate {
  id: string;
  duration: number; // seconds
  currentHook: string;
  scores: Record<CategoryId, number>;
  why: Record<CategoryId, Explanation>;
  keep: { title: string; detail: string }; // the one thing that's already good
  fixes: Fix[];
  hooks: HookOption[];
  /** Timeline per applied-fix combination, keyed by sorted fix ids joined with "+" ("" = original). */
  timelines: Record<string, Beat[]>;
}

// Text may contain {brand}, {audience}, {platform}, {message}; lib/copilot.ts fills them from the brief.
const CODING: AnalysisTemplate = {
  id: "coding",
  duration: 20,
  currentHook: "Hey guys, today I want to show you something cool I've been using…",
  scores: { hook: 92, brief: 96, product: 81, authenticity: 74, pacing: 68, cta: 89 },
  why: {
    hook: {
      why: "Your opening establishes a clear problem within the first two seconds, and on-screen text repeats it for viewers watching muted.",
      evidence: ["Problem stated at 0.8s", "Face and text on screen from frame one", "Retention-friendly cut at 2.4s"],
      recommend: { label: "Lead with the outcome instead of a greeting", from: "“Hey guys…”", to: "a result-first line" },
    },
    brief: {
      why: "The video says the required message almost word for word and speaks directly to {audience}.",
      evidence: ["Required message heard at 9.6s", "Audience cues: laptop, code editor, dorm desk", "Goal ({platform} signup) matches the CTA"],
    },
    product: {
      why: "{brand} is shown clearly, but only after the talking intro. Viewers who leave in the first 5 seconds never see it.",
      evidence: ["First product frame at 7.2s", "Result shown at 12.0s, after the benefit claim", "UI readable on mobile"],
      recommend: { label: "Show the result right after the demo", from: "Benefit → Proof", to: "Proof → Benefit" },
      fixId: "proof",
    },
    authenticity: {
      why: "The delivery feels a little scripted. Generic greetings and stock phrasing lower trust with {audience}.",
      evidence: ["Generic opener detected", "Two reads sound scripted (4.1s, 15.3s)", "Natural setting and handheld framing help"],
      recommend: { label: "Open with a personal, specific line", from: "Generic greeting", to: "First-person result" },
    },
    pacing: {
      why: "Your product demonstration starts at 7.2 seconds. For short-form content, the core visual should appear much earlier.",
      evidence: ["4.8s of talking before anything is shown", "Average shot length 3.1s (target under 2s)", "Most drop-off happens before 5s on {platform}"],
      recommend: { label: "Move product demonstration", from: "7.2s", to: "2.4s" },
      fixId: "pacing",
    },
    cta: {
      why: "Your final CTA is clear, spoken and on screen, and it matches the goal in your brief.",
      evidence: ["CTA spoken at 16.2s", "On-screen link sticker", "One single action asked"],
    },
  },
  keep: { title: "Strong CTA", detail: "Your final CTA is clear and matches the goal. Keep it." },
  fixes: [
    {
      id: "pacing",
      title: "Weak opening",
      detail: "Your product appears at 7.2 seconds.",
      recommended: "Introduce the product within the first 3 seconds.",
      change: { from: "7.2s", to: "2.4s" },
      severity: "critical",
      effects: { pacing: 96 },
    },
    {
      id: "proof",
      title: "Product proof is delayed",
      detail: "You explain the benefit before showing the result.",
      recommended: "Show the result first, then explain why it matters.",
      change: { from: "Benefit → Proof", to: "Proof → Benefit" },
      severity: "critical",
      effects: { product: 96 },
    },
  ],
  hooks: [
    { id: "h1", text: "I stopped spending 3 hours on this.", score: 94, why: "Specific, personal, and promises a payoff. The number makes it concrete and creates a curiosity gap.", effects: { hook: 94, authenticity: 86 } },
    { id: "h2", text: "This completely changed how I write code.", score: 91, why: "A strong transformation claim aimed squarely at developers. Slightly less specific than option 1.", effects: { hook: 91, authenticity: 84 } },
    { id: "h3", text: "I wish I knew this when I started coding.", score: 88, why: "Relatable regret hook that works well with younger audiences, but delays the product reveal.", effects: { hook: 88, authenticity: 85 } },
  ],
  timelines: {
    "": [
      { label: "Hook", start: 0, end: 2.4, kind: "hook" },
      { label: "Intro", start: 2.4, end: 4.8, kind: "talk" },
      { label: "Benefit", start: 4.8, end: 7.2, kind: "benefit" },
      { label: "Product Demo", start: 7.2, end: 12, kind: "demo" },
      { label: "Proof", start: 12, end: 16, kind: "proof" },
      { label: "CTA", start: 16, end: 20, kind: "cta" },
    ],
    pacing: [
      { label: "Hook", start: 0, end: 2.4, kind: "hook" },
      { label: "Product Demo", start: 2.4, end: 7, kind: "demo" },
      { label: "Benefit", start: 7, end: 9.4, kind: "benefit" },
      { label: "Proof", start: 9.4, end: 13.4, kind: "proof" },
      { label: "CTA", start: 13.4, end: 17.4, kind: "cta" },
    ],
    proof: [
      { label: "Hook", start: 0, end: 2.4, kind: "hook" },
      { label: "Intro", start: 2.4, end: 4.8, kind: "talk" },
      { label: "Product Demo", start: 4.8, end: 9.6, kind: "demo" },
      { label: "Proof", start: 9.6, end: 13.6, kind: "proof" },
      { label: "Benefit", start: 13.6, end: 16, kind: "benefit" },
      { label: "CTA", start: 16, end: 20, kind: "cta" },
    ],
    "pacing+proof": [
      { label: "Hook", start: 0, end: 2.4, kind: "hook" },
      { label: "Product Demo", start: 2.4, end: 7, kind: "demo" },
      { label: "Proof", start: 7, end: 11, kind: "proof" },
      { label: "Benefit", start: 11, end: 13.4, kind: "benefit" },
      { label: "CTA", start: 13.4, end: 17.4, kind: "cta" },
    ],
  },
};

const FITNESS: AnalysisTemplate = {
  ...CODING,
  id: "fitness",
  duration: 20, // shares the coding timelines below
  currentHook: "So I've been trying this new app for a couple of weeks…",
  scores: { hook: 78, brief: 90, product: 86, authenticity: 82, pacing: 72, cta: 84 },
  why: {
    ...CODING.why,
    hook: {
      why: "The opening is soft. Nothing visual happens in the first two seconds, and the line doesn't promise a payoff.",
      evidence: ["First movement at 2.1s", "No on-screen text in the hook", "Greeting-style opener"],
      recommend: { label: "Open on the workout itself", from: "Talking head", to: "Mid-rep action shot" },
    },
    pacing: {
      why: "The workout starts at 7.2 seconds. On {platform}, viewers decide in about 2 seconds whether to keep watching.",
      evidence: ["7.2s before the first exercise", "Long static shot at 3–7s", "Good energy once the workout starts"],
      recommend: { label: "Move the first exercise", from: "7.2s", to: "2.4s" },
      fixId: "pacing",
    },
  },
  fixes: [
    { ...CODING.fixes[0], detail: "The first exercise appears at 7.2 seconds.", recommended: "Open on the workout within the first 3 seconds.", change: { from: "7.2s", to: "2.4s" }, effects: { pacing: 93 } },
    { ...CODING.fixes[1], effects: { product: 94 } },
  ],
  hooks: [
    { id: "h1", text: "20 minutes. No gym. This is the whole workout.", score: 93, why: "States the promise and the constraint immediately, matching the brief's message.", effects: { hook: 93, authenticity: 86 } },
    { id: "h2", text: "I had zero time to train, until this.", score: 90, why: "Relatable problem for busy professionals, with a clear turn.", effects: { hook: 90, authenticity: 87 } },
    { id: "h3", text: "My trainer hates that this works.", score: 86, why: "High curiosity, but slightly clickbait for a premium tone.", effects: { hook: 86, authenticity: 80 } },
  ],
};

export const TEMPLATES: Record<string, AnalysisTemplate> = { coding: CODING, fitness: FITNESS };

export const ANALYSIS_STEPS = [
  "Understanding your brief",
  "Analyzing the opening hook",
  "Checking product visibility",
  "Checking pacing",
  "Checking brief alignment",
  "Evaluating CTA",
];

/** Demo history shown on first visit so the dashboard isn't empty. */
export const SEED_HISTORY: { exampleId: string; applied: string[]; hookId?: string; hoursAgo: number; video: { topic: string; i: number; name: string } }[] = [
  { exampleId: "coding", applied: ["pacing", "proof"], hookId: "h1", hoursAgo: 2, video: { topic: "neon", i: 3, name: "coding-reel-v3.mp4" } },
  { exampleId: "fitness", applied: ["pacing"], hoursAgo: 27, video: { topic: "sport", i: 2, name: "pulse-tiktok-final.mp4" } },
];
