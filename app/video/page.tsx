import { Suspense } from "react";
import Studio from "@/components/studio/Studio";

export const metadata = { title: "Video - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Studio kind="video" />
    </Suspense>
  );
}
