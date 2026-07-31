import type { Metadata } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import { MusicProvider } from "@/components/music/MusicProvider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Golden Kids Adventure Universe",
  description: "Collect characters, earn XP, and grow your Golden Kids adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
