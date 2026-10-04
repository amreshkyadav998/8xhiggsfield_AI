import { Suspense } from "react";
import Generator from "@/components/Generator";

export const metadata = { title: "Image - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Generator kind="image" />
    </Suspense>
  );
}
