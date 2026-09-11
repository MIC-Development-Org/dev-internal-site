import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
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
