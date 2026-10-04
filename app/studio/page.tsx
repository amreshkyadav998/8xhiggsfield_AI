import { Suspense } from "react";
import Studio from "./Studio";

export const metadata = { title: "Studio - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}
