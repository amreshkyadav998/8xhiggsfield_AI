"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Brief } from "@/lib/creatorCopilotMockData";
import { useCopilotHistory, type Analysis, type VideoRef } from "@/lib/copilot";
import Home from "@/components/copilot/Home";
import BriefStep from "@/components/copilot/BriefStep";
import Analyzing from "@/components/copilot/Analyzing";
import Results from "@/components/copilot/Results";
import Improve from "@/components/copilot/Improve";
import Ready, { Done } from "@/components/copilot/Ready";
import { Stepper, btnPrimary } from "@/components/copilot/ui";

type Step = "results" | "improve" | "ready" | "done";
const STEP_INDEX: Record<Step, number> = { results: 1, improve: 2, ready: 3, done: 4 };

/**
 * URL is the source of truth so back/forward and refresh work:
 *   /creator-copilot                   home
 *   /creator-copilot?new=1[&asset=…]   brief (optionally preselecting a generated video)
 *   /creator-copilot?id=…&step=…       an analysis at results | improve | ready | done
 * The analyzing sequence is transient local state between brief and results.
 */
export default function CreatorCopilot() {
  const params = useSearchParams();
  const router = useRouter();
  const hist = useCopilotHistory();
  const [running, setRunning] = useState<{ brief: Brief; video: VideoRef } | null>(null);

  const id = params.get("id");
  const step = (params.get("step") as Step) || "results";
  const isNew = params.has("new") || params.has("asset");
  const a = id ? hist.list.find((x) => x.id === id) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, step, isNew, running]);

  const go = (an: Analysis, s: Step, extra = "") => router.push(`/creator-copilot?id=${an.id}&step=${s}${extra}`, { scroll: false });
  const update = (an: Analysis) => hist.save(an);

  let content: React.ReactNode;
  let current = 0;
  if (running) {
    current = 1;
    content = (
      <Analyzing
        brief={running.brief}
        video={running.video}
        onDone={(an) => {
          hist.save(an);
          setRunning(null);
          go(an, "results");
        }}
      />
    );
  } else if (isNew) {
    current = 0;
    content = <BriefStep initialAsset={params.get("asset") ?? undefined} onAnalyze={(brief, video) => setRunning({ brief, video })} />;
  } else if (id) {
    if (!hist.ready) content = <div className="shimmer h-96 rounded-3xl" />;
    else if (!a)
      content = (
        <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <h2 className="text-xl font-bold">This analysis isn&apos;t in your history.</h2>
          <p className="mt-1 text-mute">It may have been cleared, or it was created in another browser.</p>
          <Link href="/creator-copilot?new=1" className={`${btnPrimary} mt-6`}>
            Analyze a Video
          </Link>
        </div>
      );
    else {
      current = STEP_INDEX[step] ?? 1;
      content =
        step === "improve" ? (
          <Improve a={a} focus={params.get("fix") ?? undefined} onChange={update} onContinue={() => go(a, "ready")} />
        ) : step === "ready" ? (
          <Ready a={a} onSubmit={() => (hist.save({ ...a, submittedAt: Date.now() }), go(a, "done"))} onBack={() => go(a, "improve")} />
        ) : step === "done" ? (
          <Done a={a} />
        ) : (
          <Results a={a} onFix={(fix) => go(a, "improve", fix ? `&fix=${fix}` : "")} onContinue={() => go(a, "improve")} />
        );
    }
  }

  if (!content) return <Home list={hist.list} ready={hist.ready} onClear={hist.clear} />;

  const toStep = (i: number) => {
    if (i === 0) return router.push("/creator-copilot?new=1", { scroll: false });
    if (a) go(a, (["results", "results", "improve", "ready"] as Step[])[i]);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/creator-copilot" onClick={() => setRunning(null)} className="text-sm text-mute hover:text-white">
          ← Creator Copilot
        </Link>
        <Stepper current={Math.min(current, 3)} onStep={running ? undefined : toStep} />
      </div>
      {content}
    </div>
  );
}
