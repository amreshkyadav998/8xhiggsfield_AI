import CodeBlock from "@/components/CodeBlock";

export const metadata = { title: "MCP - Frameforge" };

const DOTS = [
  ["Character Creator", "Designs a consistent character and keeps it on-model across shots."],
  ["Cinematic Director", "Turns a script into a shot list, then renders each shot."],
  ["Content Lead", "Plans a week of posts and batches the generations."],
  ["Motion Designer", "Adds camera moves and effects to stills."],
];

export default function Mcp() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <span className="rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">Model Context Protocol</span>
      <h1 className="mt-3 text-4xl font-black">Your studio, inside ChatGPT and Claude</h1>
      <p className="mt-3 text-mute">
        Connect Frameforge as an MCP server and your assistant can generate images, video and audio with your account and credits. Every render it starts shows up in Assets.
      </p>

      <h2 className="mb-3 mt-10 text-lg font-semibold">1. Add the server</h2>
      <CodeBlock
        label="claude_desktop_config.json"
        code={`{
  "mcpServers": {
    "frameforge": {
      "url": "https://mcp.frameforge.app/sse",
      "headers": { "Authorization": "Bearer <YOUR_API_KEY>" }
    }
  }
}`}
      />
      <p className="mt-2 text-xs text-mute">In ChatGPT: Settings → Connectors → Add custom connector, and paste the same URL. Get a key on the API page.</p>

      <h2 className="mb-3 mt-10 text-lg font-semibold">2. Ask for what you want</h2>
      <CodeBlock label="Example" code={`"Make three 5-second vertical clips of a coffee pour for TikTok, warm morning light. Use under 50 credits."`} />

      <h2 id="dots" className="mb-3 mt-10 scroll-mt-24 text-lg font-semibold">Dots: specialist agents</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {DOTS.map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line bg-panel p-4">
            <div className="font-semibold">● {t}</div>
            <p className="mt-1 text-sm text-mute">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-mute">Demo build: the MCP endpoint above is illustrative and not live.</p>
    </div>
  );
}
