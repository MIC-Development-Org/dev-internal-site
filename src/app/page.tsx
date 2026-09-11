import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { HeroBackgroundVideo } from "@/components/f1/hero-background-video";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-white">
      <HeroBackgroundVideo />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">
          MIC Development Department
        </p>
        <h1 className="max-w-2xl text-4xl font-bold drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-6xl">
          Pit Lane
        </h1>
        <p className="max-w-xl text-balance text-neutral-300">
          Team formation, project showcase, and the department leaderboard — all
          in one dashboard. Lights out, and away we go.
        </p>
        <Button render={<Link href="/login" />} nativeButton={false} size="lg">
          Enter the garage
        </Button>
      </div>
    </div>
  );
}
