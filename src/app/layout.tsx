import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LightsOutLoader } from "@/components/f1/lights-out-loader";
import { RouteTransitionLoader } from "@/components/f1/route-transition-loader";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pit Lane — MIC Development Department",
  description: "Team formation, project showcase, and the leaderboard for the MIC Development Department.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
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
