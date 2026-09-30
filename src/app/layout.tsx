import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LightsOutLoader } from "@/components/f1/lights-out-loader";
import { RouteTransitionLoader } from "@/components/f1/route-transition-loader";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pit Lane — MIC Development Department",
  description: "Team formation, project tracking, and the leaderboard for the MIC Development Department.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LightsOutLoader />
        <RouteTransitionLoader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
