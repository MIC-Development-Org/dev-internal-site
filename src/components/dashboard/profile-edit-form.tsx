"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export function ProfileEditForm({ batch, photoUrl }: { batch: string; photoUrl: string }) {
  const [state, action] = useActionState(updateProfile, {});

  useEffect(() => {
    if (state.success) toast.success("Profile updated.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="batch">Batch / Year</Label>
        <Input id="batch" name="batch" defaultValue={batch} placeholder="e.g. 2nd Year, 2027" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input id="photoUrl" name="photoUrl" defaultValue={photoUrl} placeholder="https://..." />
      </div>
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}
