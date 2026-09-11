"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LIGHT_COUNT = 5;
const STEP_MS = 220;
const HOLD_MS = 260;

// Short synthesized blip for each light coming on, and a lower "go" tone
// for lights-out — no audio asset to ship, just two oscillator tones.
function playTone(ctx: AudioContext, frequency: number, durationMs: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

/**
 * Shows once per browser session on first paint: five lights illuminate
 * left to right, hold, then go dark together ("lights out and away we go").
 */
export function LightsOutLoader() {
  const [visible, setVisible] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [goingDark, setGoingDark] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pitlane-lights-shown")) return;
    // Client-only reveal, gated on sessionStorage: must start hidden during
    // SSR to avoid a hydration mismatch, so the flip has to happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);

    // Autoplay policies mean this can stay silent until the user has
    // interacted with the page at least once — that's fine, the visuals
    // still play either way.
    const ctx = typeof AudioContext !== "undefined" ? new AudioContext() : null;
    const beep = (frequency: number, durationMs: number) => {
      try {
        ctx?.resume();
        if (ctx) playTone(ctx, frequency, durationMs);
      } catch {
        // Ignore — audio is a nice-to-have on top of the light animation.
      }
    };

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= LIGHT_COUNT; i++) {
      timers.push(
        setTimeout(() => {
          setLitCount(i);
          beep(700, 90);
        }, i * STEP_MS)
      );
    }
    timers.push(
      setTimeout(() => {
        setGoingDark(true);
        beep(320, 240);
      }, LIGHT_COUNT * STEP_MS + HOLD_MS)
    );
    timers.push(
      setTimeout(() => {
        setVisible(false);
        // Marked done only once the sequence actually finishes (not at the
        // start): React Strict Mode's dev-only double effect invocation
        // clears these timers on the first pass, and marking the flag up
        // front made the second pass bail immediately, leaving the overlay
        // stuck on screen with the lights never lit.
        sessionStorage.setItem("pitlane-lights-shown", "1");
      }, LIGHT_COUNT * STEP_MS + HOLD_MS + 400)
    );
    return () => {
      timers.forEach(clearTimeout);
      ctx?.close().catch(() => {});
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-4">
            {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-neutral-700 transition-colors duration-150 sm:h-12 sm:w-12"
                style={{
                  backgroundColor:
                    !goingDark && i < litCount ? "var(--primary)" : "transparent",
                  boxShadow:
                    !goingDark && i < litCount
                      ? "0 0 18px var(--primary)"
                      : "none",
                }}
              />
            ))}
          </div>
          <span className="sr-only">Lights out and away we go</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
