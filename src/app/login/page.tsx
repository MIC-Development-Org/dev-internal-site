import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
      <div className="space-y-2">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">
          Pit Lane
        </p>
        <h1 className="text-3xl font-bold">MIC Development Department</h1>
        <p className="max-w-sm text-sm text-neutral-400">
          Sign in with your VIT student email to enter the garage.
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
      <p className="text-xs text-neutral-500">
        Restricted to @vitstudent.ac.in accounts.
      </p>
    </div>
  );
}
