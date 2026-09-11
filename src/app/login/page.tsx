import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HeroBackgroundVideo } from "@/components/f1/hero-background-video";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-black px-6 text-center text-white">
      <HeroBackgroundVideo />

      <div className="relative z-10 space-y-2">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">
          Pit Lane
        </p>
        <h1 className="text-3xl font-bold drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
          MIC Development Department
        </h1>
        <p className="max-w-sm text-sm text-neutral-300">
          Sign in with your VIT student email to enter the garage.
        </p>
      </div>
      <form
        className="relative z-10"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <Button type="submit" size="lg" className="gap-2">
          Sign in with Google
        </Button>
      </form>
      <p className="relative z-10 text-xs text-neutral-400">
        Restricted to @vitstudent.ac.in accounts.
      </p>
    </div>
  );
}
