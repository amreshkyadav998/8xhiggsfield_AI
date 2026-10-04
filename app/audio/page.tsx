import { Suspense } from "react";
import AudioTool from "./AudioTool";

export const metadata = { title: "Audio - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <AudioTool />
    </Suspense>
  );
}
