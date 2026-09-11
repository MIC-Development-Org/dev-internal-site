import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="text-primary">
        <g className="origin-center animate-[spin_3s_linear_infinite]">
          <rect x="30" y="26" width="60" height="10" rx="5" fill="currentColor" />
          <rect x="48" y="16" width="24" height="10" rx="3" fill="currentColor" />
          <circle cx="42" cy="42" r="7" fill="currentColor" />
          <circle cx="78" cy="42" r="7" fill="currentColor" />
        </g>
      </svg>
      <h1 className="text-3xl font-bold">You&apos;ve gone off track.</h1>
      <p className="max-w-sm text-sm text-neutral-400">
        This page spun out somewhere. Let&apos;s get you back on the racing line.
      </p>
      <Button render={<Link href="/" />} nativeButton={false} className="mt-2">
        Back to the pit lane
      </Button>
    </div>
  );
}
