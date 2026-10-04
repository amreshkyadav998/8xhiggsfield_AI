// Deterministic procedural art so the mocked pipeline needs no assets or paid API.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function artSvg(prompt: string, seed: number, animated: boolean, hueBase?: number) {
  const r = rng(hash(prompt) ^ seed);
  const hue = hueBase ?? Math.floor(r() * 360);
  const blobs: string[] = [];
  for (let i = 0; i < 6; i++) {
    const h = (hue + i * 38 + r() * 30) % 360;
    const cx = 10 + r() * 80;
    const cy = 10 + r() * 80;
    const rad = 18 + r() * 34;
    const dur = 6 + r() * 6;
    const dx = (r() - 0.5) * 30;
    const dy = (r() - 0.5) * 30;
    const anim = animated
      ? `<animateTransform attributeName="transform" type="translate" values="0 0;${dx.toFixed(1)} ${dy.toFixed(1)};0 0" dur="${dur.toFixed(1)}s" repeatCount="indefinite"/>`
      : "";
    blobs.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="hsl(${h.toFixed(0)} 85% ${45 + r() * 20}%)" opacity="${(0.55 + r() * 0.35).toFixed(2)}">${anim}</circle>`
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter><radialGradient id="v"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".65"/></radialGradient></defs><rect width="100" height="100" fill="hsl(${hue} 40% 8%)"/><g filter="url(#b)">${blobs.join("")}</g><rect width="100" height="100" fill="url(#v)"/></svg>`;
}

export const artUrl = (prompt: string, seed: number, animated: boolean, hue?: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(artSvg(prompt, seed, animated, hue))}`;

export function waveSvg(prompt: string, seed: number) {
  const r = rng(hash(prompt) ^ seed);
  const hue = Math.floor(r() * 360);
  let bars = "";
  for (let i = 0; i < 48; i++) {
    const h = 6 + r() * 70 * Math.sin((i / 48) * Math.PI);
    bars += `<rect x="${i * 2 + 2}" y="${(50 - h / 2).toFixed(1)}" width="1.2" height="${h.toFixed(1)}" rx=".6" fill="hsl(${hue} 90% 65%)"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="hsl(${hue} 40% 8%)"/>${bars}</svg>`;
}
export const waveUrl = (prompt: string, seed: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(waveSvg(prompt, seed))}`;
