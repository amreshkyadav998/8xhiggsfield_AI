"use client";
import { useState } from "react";
import Media from "@/components/Media";
import { VOICES, type Voice } from "@/lib/catalog";
import { byTopic } from "@/lib/media";
import { playVoice, stopAudio } from "@/lib/audio";

export const voiceAvatar = (v: Voice) => byTopic(v.gender === "male" ? "man" : "portrait", VOICES.indexOf(v) + 1, "image");

/** Selected voice card that expands into a list with instant previews. */
export default function VoicePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const v = VOICES.find((x) => x.id === value) ?? VOICES[0];

  const preview = (x: Voice) => {
    if (playing === x.id) return stopAudio();
    setPlaying(x.id);
    playVoice(`Hi, I'm ${x.name}. ${x.desc}, ready for your next project.`, VOICES.indexOf(x), () => setPlaying(null), x);
  };

  const row = (x: Voice, selected = false) => (
    <div className={`flex items-center gap-3 rounded-xl p-2 ${selected ? "bg-white/10" : ""}`}>
      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
        <Media item={voiceAvatar(x)} ratio="1:1" width={80} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{x.name}</span>
        <span className="block truncate text-xs text-mute">
          {x.desc} · {x.lang}
        </span>
      </span>
      <button onClick={(e) => (e.stopPropagation(), preview(x))} aria-label={`Preview ${x.name}`} className={`grid h-9 w-9 place-items-center rounded-full text-sm ${playing === x.id ? "bg-accent text-black" : "bg-white/10 hover:bg-white/20"}`}>
        {playing === x.id ? "■" : "▶"}
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-line bg-black/20 p-2">
      <div className="flex items-center justify-between px-2 pb-1 pt-1 text-sm text-mute">
        Voice
        <button onClick={() => setOpen(!open)} className="rounded-lg px-2 py-1 text-white hover:bg-white/10">
          {open ? "Done" : "✎ Change"}
        </button>
      </div>
      {open ? (
        <div className="space-y-1">
          {VOICES.map((x) => (
            <div key={x.id} onClick={() => onChange(x.id)} className={`cursor-pointer rounded-xl ${x.id === v.id ? "ring-1 ring-accent" : "hover:bg-white/5"}`}>
              {row(x, x.id === v.id)}
            </div>
          ))}
        </div>
      ) : (
        row(v)
      )}
    </div>
  );
}
