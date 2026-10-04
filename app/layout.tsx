import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import Nav from "@/components/Nav";
import CreditToast from "@/components/CreditToast";
import Footer from "@/components/Footer";

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
          <Footer />
          <CreditToast />
        </AppProvider>
      </body>
    </html>
  );
}
