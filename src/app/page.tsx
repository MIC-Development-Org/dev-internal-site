import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroBackgroundVideo } from "@/components/f1/hero-background-video";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-black px-6 text-center text-white">
      <HeroBackgroundVideo />

      {/* Subtle film-grain noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/*
          unoptimized — bypasses Next.js image cache so the raw processed PNG is always served.
          mix-blend-mode: screen — extra insurance: any residual dark pixels become transparent
          on a dark background without affecting the bright red logo pixels.
        */}
        <Image
          src="/mic-logo.png"
          alt="MIC Logo"
          width={340}
          height={128}
          priority
          unoptimized
          style={{ mixBlendMode: "screen" }}
          className="drop-shadow-[0_0_48px_rgba(255,24,1,0.6)]"
        />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
            Development Department
          </h1>
          <p className="max-w-sm text-sm text-neutral-300">
            Sign in with your VIT student email to get started.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <Button type="submit" size="lg" className="gap-2">
            Sign in with Google
          </Button>
        </form>

        <p className="text-xs text-neutral-400">
          Restricted to @vitstudent.ac.in accounts.
        </p>
      </div>
    </div>
  );
}
