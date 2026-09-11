"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Shared error-boundary content for route segments — keeps the surrounding layout (nav) intact. */
export function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-6 py-16 text-center">
      <div className="relative">
        <img
          src="/images/f1-car-error.png"
          alt=""
          className="h-14 w-auto -rotate-6 grayscale"
          style={{ filter: "grayscale(1) sepia(1) saturate(4) hue-rotate(-40deg)" }}
        />
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="absolute -right-2 -top-2 text-destructive"
        >
          <path d="M4 4 L20 20 M20 4 L4 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">Retirement.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something failed in this sector. Box, box — try again.
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        Restart engine
      </Button>
    </div>
  );
}
