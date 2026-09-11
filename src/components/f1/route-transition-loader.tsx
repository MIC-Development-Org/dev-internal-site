"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A small top-down car silhouette that zips across the top of the screen
 * on every route change, standing in for a plain progress bar.
 */
export function RouteTransitionLoader() {
  const pathname = usePathname();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // Re-triggers the fly-by animation on every route change (an external
    // event from the router), which is exactly what this effect syncs to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRunning(true);
    const t = setTimeout(() => setRunning(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 overflow-hidden">
      <AnimatePresence>
        {running && (
          <motion.div
            className="absolute top-0 flex -translate-y-1/2 items-center"
            initial={{ left: "-5%" }}
            animate={{ left: "105%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          >
            <svg
              width="28"
              height="14"
              viewBox="0 0 28 14"
              fill="none"
              className="text-primary drop-shadow-[0_0_6px_var(--primary)]"
            >
              <rect x="2" y="5" width="20" height="4" rx="2" fill="currentColor" />
              <rect x="8" y="2" width="8" height="4" rx="1.5" fill="currentColor" />
              <circle cx="7" cy="11" r="2.5" fill="currentColor" />
              <circle cx="19" cy="11" r="2.5" fill="currentColor" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
