"use client";

import { useEffect, useRef } from "react";
import { DashboardNavbar } from "@/components/f1/dashboard-navbar";
import type { NavItem } from "@/components/app-shell";

// Fraction of normal speed the background footage plays at.
const PLAYBACK_RATE = 0.55;

export function DashboardHero({
  videoSrc,
  firstName,
  navItems,
  userName,
  signOutAction,
  rank,
  points,
  teamName,
}: {
  videoSrc: string;
  firstName: string;
  navItems: NavItem[];
  userName: string;
  signOutAction: () => Promise<void>;
  rank: number;
  points: number;
  teamName: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function applyRate() {
      video!.playbackRate = PLAYBACK_RATE;
    }
    // Set once metadata is ready rather than immediately on mount — some
    // browsers reset playbackRate when the source finishes loading.
    video.addEventListener("loadedmetadata", applyRate);
    if (video.readyState >= 1) applyRate();
    return () => video.removeEventListener("loadedmetadata", applyRate);
  }, []);

  return (
    <section className="relative h-svh w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Subtle scrim: just enough for text legibility, footage stays visible. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55" />

      <DashboardNavbar navItems={navItems} userName={userName} signOutAction={signOutAction} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-label-caps text-white/70">MIC Development Department</p>
        <h1 className="text-headline-xl text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
          Hiii, {firstName}.
        </h1>
        <p className="max-w-md text-body-lg text-white/80">
          Track your team, projects and progress — all in one place.
        </p>
        <p className="mt-2 text-label-caps text-white/50">Scroll to explore ↓</p>
      </div>

      {/* Minimal department telemetry — the user's own status, not a stunt
          HUD. Small edge text only, nowhere near the footage's focal area. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 right-6 z-10 hidden flex-col items-end gap-0.5 md:flex md:bottom-8 md:right-10"
      >
        <span className="text-label-caps text-white/40">Your Status</span>
        <span className="text-label-mono text-white/70">
          P{rank} · {points} pts · {teamName ?? "No team"}
        </span>
      </div>
    </section>
  );
}
