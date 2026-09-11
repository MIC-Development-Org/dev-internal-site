import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <h1 className="text-3xl font-bold">Page not found.</h1>
      <p className="max-w-sm text-sm text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <p className="text-xs uppercase tracking-widest text-neutral-500">You&apos;ve gone off track.</p>
      <Button render={<Link href="/" />} nativeButton={false} className="mt-2">
        Back to Pit Lane
      </Button>
    </div>
  );
}
