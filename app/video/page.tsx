import { Suspense } from "react";
import VideoTool from "./VideoTool";

export const metadata = { title: "Video - Frameforge" };

export default function Page() {
  return (
    <Suspense>
      <VideoTool />
    </Suspense>
  );
}
