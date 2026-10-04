import { Suspense } from "react";
import Generator from "@/components/Generator";

export const metadata = { title: "Audio - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Generator kind="audio" />
    </Suspense>
  );
}
