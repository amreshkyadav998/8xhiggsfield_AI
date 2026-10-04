# Frameforge

A rebuild of the core Higgsfield workflow (prompt to image/video) for the 8x assignment. It is not a 1:1 copy of the UI. The product decisions are my own.

## What it does
- **Studio**: image and video modes, model picker, aspect ratio, duration or image count, and a live credit cost on the Generate button.
- **Jobs**: queued, then rendering with progress, then done. Jobs survive reloads because status is derived from timestamps. Canceling a running job refunds its credits.
- **Effects**: one-click presets that load a prompt and settings into the studio.
- **Accounts and credits**: sign up and log in, 50 free credits, a plan switcher and top-ups.

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
