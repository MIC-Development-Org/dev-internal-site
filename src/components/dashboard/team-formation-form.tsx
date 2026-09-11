"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createTeam } from "@/lib/actions/team";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";

export function TeamFormationForm() {
  const [state, action] = useActionState(createTeam, {});
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Team created. Welcome to the grid.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      setEmails("");
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Constructor name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Scuderia Byte"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="emails">Teammate VIT emails</Label>
        <Textarea
          id="emails"
          name="emails"
          placeholder="one.email@vitstudent.ac.in, two.email@vitstudent.ac.in"
          rows={4}
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Comma or newline separated. Total roster (including you) must be 5-6 members with 1-2 seniors.
        </p>
      </div>
      <SubmitButton pendingLabel="Forming up...">Form team</SubmitButton>
    </form>
  );
}
