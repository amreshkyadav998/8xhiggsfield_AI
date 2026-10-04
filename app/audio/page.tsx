import { Suspense } from "react";
import Studio from "@/components/studio/Studio";

export const metadata = { title: "Audio - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Studio kind="audio" />
    </Suspense>
  );
}
