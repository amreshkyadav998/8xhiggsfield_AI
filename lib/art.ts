// Deterministic waveform art for audio outputs.
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
