"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import { releaseProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";

export function ReleaseProjectButton() {
  const [state, action, isPending] = useActionState(releaseProject, {});
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfirming(false);
    }
    if (state.success) toast.success("Project released back to pool.");
  }, [state]);

  if (confirming) {
    return (
      <form action={action} className="inline-flex items-center gap-1.5">
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          disabled={isPending}
          className="h-7 text-[11px]"
        >
          {isPending ? "Releasing..." : "Confirm Release"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => setConfirming(false)}
          className="h-7 text-[11px]"
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setConfirming(true)}
      className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-red-400"
    >
      <Undo2 className="size-3" />
      Switch Project
    </Button>
  );
}
