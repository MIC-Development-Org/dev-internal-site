"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LIGHT_COUNT = 5;
const STEP_MS = 220;
const HOLD_MS = 260;

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
    sessionStorage.setItem("pitlane-lights-shown", "1");
    // Client-only reveal, gated on sessionStorage: must start hidden during
    // SSR to avoid a hydration mismatch, so the flip has to happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= LIGHT_COUNT; i++) {
      timers.push(setTimeout(() => setLitCount(i), i * STEP_MS));
    }
    timers.push(
      setTimeout(() => setGoingDark(true), LIGHT_COUNT * STEP_MS + HOLD_MS)
    );
    timers.push(
      setTimeout(() => setVisible(false), LIGHT_COUNT * STEP_MS + HOLD_MS + 400)
    );
    return () => timers.forEach(clearTimeout);
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
