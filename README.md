# Frameforge

**Live:** https://8xhiggsfield-ai.vercel.app · **Repo:** https://github.com/amreshkyadav998/8xhiggsfield_AI

A rebuild of the core Higgsfield workflow (prompt to image/video) for the 8x assignment. It is not a 1:1 copy of the UI. The product decisions are my own.

## What it does
- **Explore**: a showcase of autoplaying presets. Clicking any tile opens the right tool with its prompt filled in.
- **Image**: a full-canvas studio with a pinned prompt bar (reference images, @characters, model picker, auto aspect, quality, resolution, 1–4 outputs), a filter menu with a date-range calendar, likes and downloads, and a lightbox.
- **Video**: Create (preset picker, references, extend a clip), Edit Video and Motion Control. History and How it works sit side by side.
- **Audio**: Text to Speech (voice previews, speed, billing by script length), Voice Change (your recording, re-pitched) and Music.
- **Creator Copilot ✨** (`/creator-copilot`): Brief → Analyze → Improve → Ready.
  - Content-health score, with a "Why?" explanation for every category.
  - Fixes you can apply, shown on an original-vs-recommended timeline.
  - Hook rewrites, a submit checklist, and a link from any generated video.
- **AI Influencer, Genjutsu restyle, Assets, Pricing, MCP / API docs, Enterprise.**
- **Credits**: every button shows the exact (discounted) price it will charge, and canceling a render refunds it. Jobs survive reloads.

## What is simulated
Generation is mocked on purpose: there are no model API keys and no costs. A job runs through queued and rendering states, then returns **real stock media matched to the prompt**:
- **Image and video:** prompts are scored against a keyword-tagged library of 220 free Unsplash photos and 176 Mixkit clips (`lib/media.json`, built by `scripts/build-media.mjs`). Each output links its source.
- **Genjutsu:** it restyles *your uploaded clip* with a per-style visual filter. This is a preview of the effect, not a neural restyle.
- **Audio:** it is real and plays in the browser. Voiceover reads your script with the Web Speech API, and Score synthesizes a seeded chord loop with Web Audio.

Auth, credits and history live in `localStorage`. There are no real accounts or payments.

## Left out deliberately
Community feed, image-to-video upload, real payments, and the ChatGPT/Claude MCP integration. The studio loop and credit clarity came first.

## Run
```
npm install
npm run dev
```

AI-assisted. Prompts and responses are in `.agent-logs/`; see `CAPTURE-TEST.md` for the capture setup.
