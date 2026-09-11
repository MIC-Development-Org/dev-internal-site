"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { awardPoints } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import type { PointsTargetType } from "@/models/PointsLog";

type Target = { _id: string; name: string };

export function AwardPointsForm({ users, teams }: { users: Target[]; teams: Target[] }) {
  const [state, action] = useActionState(awardPoints, {});
  const [targetType, setTargetType] = useState<PointsTargetType>("user");
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Points awarded.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetId("");
      setAmount("");
      setReason("");
    }
  }, [state]);

  const options = targetType === "user" ? users : teams;

  function selectTargetType(next: PointsTargetType) {
    setTargetType(next);
    setTargetId("");
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Target type</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => selectTargetType("user")}
            className={`rounded-md border px-3 py-1.5 text-sm ${targetType === "user" ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => selectTargetType("team")}
            className={`rounded-md border px-3 py-1.5 text-sm ${targetType === "team" ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
          >
            Team
          </button>
        </div>
        <input type="hidden" name="targetType" value={targetType} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetId">Target</Label>
        <select
          id="targetId"
          name="targetId"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          required
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o._id} value={o._id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (use negative to deduct)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reason">Internal reason tag</Label>
        <Input
          id="reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. hackathon-win, missed-standup"
          required
        />
      </div>

      <SubmitButton pendingLabel="Awarding...">Apply</SubmitButton>
    </form>
  );
}
