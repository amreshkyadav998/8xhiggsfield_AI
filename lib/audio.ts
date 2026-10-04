// Real, in-browser audio for the mocked Audio models:
// Voiceover reads the script with the Web Speech API; Score synthesizes a seeded chord loop with Web Audio.

let stopCurrent: (() => void) | null = null;

export function stopAudio() {
  stopCurrent?.();
  stopCurrent = null;
}

export function playVoice(text: string, seed: number, onEnd: () => void) {
  stopAudio();
  if (typeof speechSynthesis === "undefined") return onEnd();
  const u = new SpeechSynthesisUtterance(text.replace(/^[^:]{0,60}:\s*/, "").replace(/[“”"]/g, ""));
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length) u.voice = voices[seed % voices.length];
  u.rate = 0.98;
  u.onend = onEnd;
  u.onerror = onEnd;
  speechSynthesis.speak(u);
  stopCurrent = () => {
    speechSynthesis.cancel();
    onEnd();
  };
}

const SCALES = [
  [0, 3, 7, 10], // minor 7
  [0, 4, 7, 11], // major 7
  [0, 2, 7, 9], // sus/6
];

export function playScore(seed: number, onEnd: () => void) {
  stopAudio();
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);
  const root = 196 * Math.pow(2, (seed % 7) / 12);
  const scale = SCALES[seed % SCALES.length];
  const prog = [0, 5, 3, 4].map((x) => (x + seed) % 7);
  const beat = 0.32;
  const t0 = ctx.currentTime + 0.05;
  let t = t0;
  for (let bar = 0; bar < 8; bar++) {
    const shift = Math.pow(2, [0, 5, 3, 7, 0, 8, 5, 7][(bar + prog[bar % 4]) % 8] / 12);
    // pad
    for (const iv of scale) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = (root / 2) * shift * Math.pow(2, iv / 12);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.3);
      g.gain.linearRampToValueAtTime(0, t + beat * 4);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + beat * 4 + 0.05);
    }
    // arpeggio
    for (let i = 0; i < 4; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = root * shift * Math.pow(2, scale[(i + bar) % 4] / 12) * 2;
      const s = t + i * beat;
      g.gain.setValueAtTime(0.25, s);
      g.gain.exponentialRampToValueAtTime(0.001, s + beat * 0.95);
      o.connect(g).connect(master);
      o.start(s);
      o.stop(s + beat);
    }
    t += beat * 4;
  }
  const timer = setTimeout(() => stopAudio(), (t - t0) * 1000 + 200);
  stopCurrent = () => {
    clearTimeout(timer);
    ctx.close();
    onEnd();
  };
}
