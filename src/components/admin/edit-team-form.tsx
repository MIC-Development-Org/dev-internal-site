"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { editTeamRoster, dissolveTeam } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";

type Candidate = { _id: string; name: string; email: string };

export function EditTeamForm({
  teamId,
  name,
  leaderId,
  memberIds,
  candidates,
}: {
  teamId: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  candidates: Candidate[];
}) {
  const [state, action] = useActionState(editTeamRoster, {});
  const [dissolveState, dissolveAction] = useActionState(dissolveTeam, {});
  const [nameValue, setNameValue] = useState(name);
  const [selected, setSelected] = useState<string[]>(memberIds);
  const [leader, setLeader] = useState(leaderId);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Team updated.");
  }, [state]);

  useEffect(() => {
    if (dissolveState.error) toast.error(dissolveState.error);
  }, [dissolveState]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <input type="hidden" name="teamId" value={teamId} />
        <input type="hidden" name="memberIds" value={selected.join(",")} />
        <input type="hidden" name="leaderId" value={leader} />
        <div className="space-y-1.5">
          <Label htmlFor="name">Team name</Label>
          <Input id="name" name="name" value={nameValue} onChange={(e) => setNameValue(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Members</Label>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {candidates.map((c) => (
              <label key={c._id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} />
                {c.name} <span className="text-xs text-muted-foreground">{c.email}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="leader-select">Leader</Label>
          <select
            id="leader-select"
            value={leader}
            onChange={(e) => setLeader(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {candidates
              .filter((c) => selected.includes(c._id))
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <SubmitButton pendingLabel="Saving...">Save roster</SubmitButton>
      </form>

      <form
        action={dissolveAction}
        onSubmit={(e) => {
          if (!confirm("Dissolve this team? This removes the roster and its project.")) e.preventDefault();
        }}
      >
        <input type="hidden" name="teamId" value={teamId} />
        <Button type="submit" variant="destructive" size="sm">
          Dissolve team
        </Button>
      </form>
    </div>
  );
}
