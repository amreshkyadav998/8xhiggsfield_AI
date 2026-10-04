# Frameforge

A rebuild of the core Higgsfield workflow (prompt to image/video) for the 8x assignment. It is not a 1:1 copy of the UI. The product decisions are my own.

## What it does
- **Studio**: image and video modes, model picker, aspect ratio, duration or image count, and a live credit cost on the Generate button.
- **Jobs**: queued, then rendering with progress, then done. Jobs survive reloads because status is derived from timestamps. Canceling a running job refunds its credits.
- **Effects**: one-click presets that load a prompt and settings into the studio.
- **Accounts and credits**: sign up and log in, 50 free credits, a plan switcher and top-ups.

## What is simulated
Generation is mocked on purpose. Output is procedural art seeded from the prompt (animated SVG for video), so there are no API keys or costs. Auth, credits and history live in `localStorage`. There are no real accounts or payments.

## Left out deliberately
Community feed, image-to-video upload, real payments, and the ChatGPT/Claude MCP integration. The studio loop and credit clarity came first.

## Run
```
npm install
npm run dev
```

AI-assisted. Prompts and responses are in `.agent-logs/`; see `CAPTURE-TEST.md` for the capture setup.
