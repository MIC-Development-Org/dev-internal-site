"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="text-destructive">
        <rect x="10" y="26" width="60" height="10" rx="5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="16" width="36" height="10" rx="3" fill="currentColor" opacity="0.5" />
        <circle cx="30" cy="42" r="7" fill="currentColor" opacity="0.7" />
        <circle cx="80" cy="42" r="7" fill="currentColor" opacity="0.7" />
        <path d="M5 5 L35 55 M85 5 L60 55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h1 className="text-3xl font-bold">Something went wrong.</h1>
      <p className="max-w-sm text-sm text-neutral-400">
        We hit an unexpected error. Try again, or head back to the dashboard.
      </p>
      <p className="text-xs uppercase tracking-widest text-destructive/70">Retirement — box, box.</p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <Button render={<Link href="/" />} nativeButton={false}>
          Back to Pit Lane
        </Button>
      </div>
    </div>
  );
}
