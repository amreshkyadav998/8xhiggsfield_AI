import { Suspense } from "react";
import Studio from "@/components/studio/Studio";

export const metadata = { title: "Image - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Studio kind="image" />
    </Suspense>
  );
}
