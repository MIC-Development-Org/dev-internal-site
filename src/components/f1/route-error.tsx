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
      <svg width="56" height="28" viewBox="0 0 56 28" fill="none" className="text-destructive">
        <rect x="4" y="12" width="30" height="7" rx="3.5" fill="currentColor" opacity="0.4" />
        <rect x="12" y="4" width="18" height="7" rx="3" fill="currentColor" opacity="0.4" />
        <circle cx="14" cy="22" r="5" fill="currentColor" opacity="0.6" />
        <circle cx="38" cy="22" r="5" fill="currentColor" opacity="0.6" />
        <path d="M2 2 L14 26 M40 2 L28 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
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
