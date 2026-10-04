"use client";
import Link from "next/link";
import { useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import { MODELS } from "@/lib/catalog";
import { useApp } from "@/lib/store";

export default function ApiDocs() {
  const { user } = useApp();
  const [key, setKey] = useState("");
  const makeKey = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    setKey("ff_live_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <span className="rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">New</span>
      <h1 className="mt-3 text-4xl font-black">API</h1>
      <p className="mt-3 text-mute">The same models and credit prices as the app, over HTTP. Jobs are async: create one, then poll or receive a webhook.</p>

      <div className="mt-8 rounded-xl border border-line bg-panel p-5">
        <div className="font-semibold">API key</div>
        {user ? (
          key ? (
            <div className="mt-3">
              <code className="block break-all rounded-lg bg-black p-3 text-sm text-accent">{key}</code>
              <p className="mt-2 text-xs text-mute">Shown once. Store it somewhere safe. (Demo key, it won&apos;t authenticate anywhere.)</p>
            </div>
          ) : (
            <button onClick={makeKey} className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black">
              Create key
            </button>
          )
        ) : (
          <p className="mt-2 text-sm text-mute">
            <Link href="/login?next=/api-docs" className="text-accent underline">
              Sign in
            </Link>{" "}
            to create a key.
          </p>
        )}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Create a generation</h2>
      <CodeBlock
        label="curl"
        code={`curl https://api.frameforge.app/v1/generations \\
  -H "Authorization: Bearer $FRAMEFORGE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "seed",
    "prompt": "neon market in the rain, slow dolly",
    "aspect_ratio": "16:9",
    "duration": 5,
    "webhook_url": "https://example.com/hook"
  }'`}
      />
      <h2 className="mb-3 mt-8 text-lg font-semibold">Response</h2>
      <CodeBlock
        label="200 OK"
        code={`{
  "id": "gen_8f2c1a",
  "status": "queued",
  "credits_charged": 15,
  "credits_remaining": 585
}`}
      />

      <h2 className="mb-3 mt-10 text-lg font-semibold">Models and pricing</h2>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs text-mute">
            <tr>
              <th className="p-3">id</th>
              <th className="p-3">Type</th>
              <th className="p-3">Credits</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => (
              <tr key={m.id} className="border-t border-line">
                <td className="p-3 font-mono text-accent">{m.id}</td>
                <td className="p-3 capitalize">{m.kind}</td>
                <td className="p-3">
                  {m.cost} {m.kind === "video" ? "per second" : "per output"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-8 text-xs text-mute">Demo build: endpoints are documented for the product design and are not live.</p>
    </div>
  );
}
