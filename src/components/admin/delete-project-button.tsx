"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { adminDeleteProject } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function DeleteProjectButton({
  projectId,
  projectTitle,
  redirectOnSuccess = false,
  variant = "destructive",
  size = "sm",
}: {
  projectId: string;
  projectTitle?: string;
  redirectOnSuccess?: boolean;
  variant?: "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(adminDeleteProject, {});
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfirming(false);
    }
    if (state.success) {
      toast.success(`Project ${projectTitle ? `"${projectTitle}" ` : ""}deleted.`);
      if (redirectOnSuccess) {
        router.push("/admin/projects");
      }
    }
  }, [state, projectTitle, redirectOnSuccess, router]);

  if (confirming) {
    return (
      <form action={action} className="inline-flex items-center gap-1.5">
        <input type="hidden" name="projectId" value={projectId} />
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          disabled={isPending}
          className="h-8 text-xs font-semibold"
        >
          {isPending ? "Deleting..." : "Confirm Delete"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => setConfirming(false)}
          className="h-8 text-xs"
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300"
    >
      <Trash2 className="size-3.5" />
      {size !== "icon" && "Delete"}
    </Button>
  );
}
