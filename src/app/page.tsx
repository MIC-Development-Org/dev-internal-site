import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <svg
          className="absolute -left-1/4 top-1/2 h-40 w-[150%] -translate-y-1/2 animate-[pit-lane-drift_9s_linear_infinite] text-primary"
          viewBox="0 0 400 60"
          fill="none"
        >
          <rect x="40" y="24" width="220" height="16" rx="8" fill="currentColor" />
          <rect x="90" y="8" width="120" height="16" rx="6" fill="currentColor" />
          <circle cx="80" cy="48" r="11" fill="currentColor" />
          <circle cx="230" cy="48" r="11" fill="currentColor" />
          <rect x="0" y="52" width="400" height="4" fill="currentColor" opacity="0.4" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">
          MIC Development Department
        </p>
        <h1 className="max-w-2xl text-4xl font-bold sm:text-6xl">Pit Lane</h1>
        <p className="max-w-xl text-balance text-neutral-400">
          Team formation, project showcase, and the department leaderboard — all
          in one dashboard. Lights out, and away we go.
        </p>
        <Button render={<Link href="/login" />} nativeButton={false} size="lg">
          Enter the garage
        </Button>
      </div>

      <style>{`
        @keyframes pit-lane-drift {
          from { transform: translateX(0) translateY(-50%); }
          to { transform: translateX(-15%) translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
