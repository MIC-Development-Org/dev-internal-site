"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A small F1 car that zips across the top of the screen on every route
 * change, standing in for a plain progress bar.
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
            <img
              src="/images/f1-car-loader.png"
              alt=""
              className="h-7 w-auto drop-shadow-[0_0_6px_var(--primary)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
