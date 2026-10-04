import { Suspense } from "react";
import Generator from "@/components/Generator";

export const metadata = { title: "Video - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Generator kind="video" />
    </Suspense>
  );
}
