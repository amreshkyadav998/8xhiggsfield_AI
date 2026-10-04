import { Suspense } from "react";
import CreatorCopilot from "./CreatorCopilot";

export const metadata = {
  title: "Creator Copilot - Frameforge",
  description: "Analyze your video against your brief, fix what's weak, and submit with confidence.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Suspense>
        <CreatorCopilot />
      </Suspense>
    </div>
  );
}
