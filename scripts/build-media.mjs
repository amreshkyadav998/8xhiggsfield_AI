// Builds lib/media.json: a keyword-tagged library of real stock media used by the mocked generator.
// Photos: Unsplash (free photos only, no Plus). Videos: Mixkit (free license).
// Run: node scripts/build-media.mjs
import fs from "node:fs";

const TOPICS = [
  { id: "neon", q: "neon city night", mix: "neon", keys: ["neon", "city", "night", "cyberpunk", "street", "rain", "market", "urban", "tokyo"] },
  { id: "rain", q: "rain window cinematic", mix: "rain", keys: ["rain", "storm", "wet", "moody", "drops", "droplets"] },
  { id: "portrait", q: "editorial portrait", mix: "woman", keys: ["portrait", "face", "woman", "model", "editorial", "influencer", "person", "selfie", "character"] },
  { id: "man", q: "male portrait cinematic", mix: "man", keys: ["man", "guy", "male", "figure", "hero", "lone"] },
  { id: "fashion", q: "street fashion outfit", mix: "fashion", keys: ["fashion", "outfit", "coat", "trench", "wardrobe", "style", "clothes", "retro", "y2k", "goth", "casual", "sporty", "theatrical", "clowncore"] },
  { id: "product", q: "luxury product photography", mix: "products", keys: ["product", "luxury", "perfume", "bottle", "watch", "commerce", "stone", "packshot"] },
  { id: "space", q: "astronaut space", mix: "space", keys: ["space", "astronaut", "galaxy", "stars", "planet", "cosmic", "nebula", "zero", "gravity", "float", "floats"] },
  { id: "forest", q: "misty forest", mix: "forest", keys: ["forest", "tree", "trees", "jungle", "nature", "fog", "mist", "woods"] },
  { id: "ocean", q: "ocean waves aerial", mix: "ocean", keys: ["ocean", "sea", "wave", "waves", "beach", "surf", "water", "underwater"] },
  { id: "mountain", q: "mountain landscape dramatic", mix: "mountain", keys: ["mountain", "mountains", "peak", "landscape", "valley", "cliff", "epic"] },
  { id: "desert", q: "desert dunes", mix: "desert", keys: ["desert", "dune", "dunes", "sand", "sahara", "dust"] },
  { id: "coffee", q: "coffee pour", mix: "coffee", keys: ["coffee", "cafe", "latte", "pour", "morning", "cup", "food", "drink"] },
  { id: "car", q: "sports car night", mix: "car", keys: ["car", "cars", "drive", "driving", "road", "racing", "highway", "vehicle"] },
  { id: "dance", q: "dancer motion", mix: "dance", keys: ["dance", "dancer", "dancing", "music", "party", "club", "move"] },
  { id: "smoke", q: "colored smoke", mix: "smoke", keys: ["smoke", "abstract", "vfx", "magic", "ink", "melt", "melts", "liquid", "gold"] },
  { id: "fire", q: "fire flames", mix: "fire", keys: ["fire", "flame", "flames", "burn", "explosion", "spark", "sparks"] },
  { id: "flowers", q: "flowers bloom", mix: "flowers", keys: ["flower", "flowers", "bloom", "garden", "petals", "spring", "rose"] },
  { id: "snow", q: "snow winter", mix: "snow", keys: ["snow", "winter", "ice", "cold", "frozen", "snowy"] },
  { id: "architecture", q: "modern architecture", mix: "architecture", keys: ["architecture", "building", "skyscraper", "interior", "room", "house", "glass", "jar", "miniature", "tiny"] },
  { id: "sport", q: "athlete action", mix: "sports", keys: ["sport", "sports", "athlete", "running", "run", "gym", "football", "skate"] },
  { id: "animals", q: "wild animal portrait", mix: "animals", keys: ["animal", "animals", "dog", "cat", "wildlife", "bird", "horse", "lion"] },
  { id: "sunset", q: "golden hour sunset", mix: "sunset", keys: ["sunset", "sunrise", "golden", "hour", "dusk", "dawn", "warm", "sky"] },
];

const UA = { "User-Agent": "curl/8.9.1", Accept: "*/*" };

async function photos(q) {
  const r = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=30`, { headers: UA });
  const d = await r.json();
  return d.results
    .filter((p) => !p.premium && !p.plus && p.urls.raw.startsWith("https://images.unsplash.com/"))
    .slice(0, 10)
    .map((p) => ({
      src: p.urls.raw.split("?")[0],
      w: p.width,
      h: p.height,
      alt: p.alt_description ?? q,
      color: p.color,
      by: p.user.name,
      link: `https://unsplash.com/photos/${p.id}`,
    }));
}

async function videos(slug) {
  const r = await fetch(`https://mixkit.co/free-stock-video/${slug}/`, { headers: UA });
  if (!r.ok) return [];
  const html = await r.text();
  const ids = [...new Set([...html.matchAll(/assets\.mixkit\.co\/videos\/(\d+)\/\1-360\.mp4/g)].map((m) => m[1]))];
  return ids.slice(0, 8).map((id) => ({
    src: `https://assets.mixkit.co/videos/${id}/${id}-360.mp4`,
    hd: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
    poster: `https://assets.mixkit.co/videos/${id}/${id}-thumb-360-0.jpg`,
    link: `https://mixkit.co/free-stock-video/${slug}/`,
  }));
}

const out = [];
for (const t of TOPICS) {
  const p = await photos(t.q);
  const v = await videos(t.mix);
  console.log(`${t.id.padEnd(14)} photos ${p.length}  videos ${v.length}`);
  out.push({ id: t.id, keys: t.keys, photos: p, videos: v });
}
fs.writeFileSync(new URL("../lib/media.json", import.meta.url), JSON.stringify(out, null, 1));
