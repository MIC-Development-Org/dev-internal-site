"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { resubmitProject } from "@/lib/actions/project";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";

export function ResubmitProjectForm() {
  const [state, action] = useActionState(resubmitProject, {});
  const [note, setNote] = useState("");

  useEffect(() => {
    if (state.error && !state.fieldErrors) toast.error(state.error);
    if (state.success) toast.success("Sent back to race control for review.");
  }, [state]);

  return (
    <form action={action} className="mt-3 space-y-2">
      <Label htmlFor="resubmit-note" className="text-xs">
        Reply to race control <span className="text-muted-foreground">(optional)</span>
      </Label>
      <Textarea
        id="resubmit-note"
        name="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="What did you change?"
        aria-invalid={Boolean(state.fieldErrors?.note)}
        aria-describedby={state.fieldErrors?.note ? "resubmit-note-error" : undefined}
      />
      <FieldError id="resubmit-note" message={state.fieldErrors?.note} />
      <SubmitButton pendingLabel="Resubmitting..." size="sm" className="gap-1.5">
        <Send className="size-3.5" />
        Resubmit for review
      </SubmitButton>
    </form>
  );
}
