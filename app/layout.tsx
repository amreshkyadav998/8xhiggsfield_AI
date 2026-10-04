import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import Nav from "@/components/Nav";
import CreditToast from "@/components/CreditToast";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frameforge - AI image and video studio",
  description: "Generate cinematic images and video from a prompt. A rebuild of the Higgsfield workflow with upfront credit costs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line px-6 py-6 text-xs text-mute">
            Frameforge is a demo rebuild for an assignment. Generation is simulated; no real models, payments or accounts.
          </footer>
          <CreditToast />
        </AppProvider>
      </body>
    </html>
  );
}
