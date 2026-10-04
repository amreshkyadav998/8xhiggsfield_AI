import Link from "next/link";

const COLS: [string, [string, string][]][] = [
  ["Create", [["AI Video", "/video"], ["AI Image", "/image"], ["Audio", "/audio"], ["AI Influencer", "/influencer"], ["Genjutsu Restyle", "/genjutsu"], ["Visual Effects", "/#vfx"]]],
  ["Models", [["Seedance", "/video?model=seed"], ["Kinetic", "/video?model=kling"], ["Soul", "/image?model=soul"], ["Nano Pro", "/image?model=nano"], ["Voiceover", "/audio?model=voice"], ["Score", "/audio?model=score"]]],
  ["Platform", [["MCP", "/mcp"], ["API", "/api-docs"], ["Assets", "/assets"], ["Projects", "/#projects"]]],
  ["Company", [["Pricing", "/pricing"], ["Enterprise", "/enterprise"], ["Sign in", "/login"]]],
];

export default function Footer() {
  return (
    <footer className="mt-20">
      <div className="bg-accent px-6 py-14 text-black">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="text-4xl font-black uppercase leading-none md:text-5xl">
            One prompt.
            <br />
            Every format.
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map(([h, links]) => (
              <div key={h}>
                <div className="mb-3 text-sm font-medium text-black/50">{h}</div>
                <ul className="space-y-2.5 font-medium">
                  {links.map(([l, href]) => (
                    <li key={l}>
                      <Link href={href} className="hover:underline">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-mute">
        <span>© 2026 Frameforge. A demo rebuild for an assignment.</span>
        <span>Generation is simulated. Photos from Unsplash, clips from Mixkit, used under their free licenses.</span>
      </div>
    </footer>
  );
}
