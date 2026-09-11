"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { Flag, ShieldCheck, Users, X } from "lucide-react";
import { cn } from "cn";
import { createTeam } from "@/lib/actions/team";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";

type TeamFormationFormProps = {
  domain: string;
  minMembers: number;
  maxMembers: number;
  minSeniors: number;
  maxSeniors: number;
};

function splitEmails(raw: string) {
  return raw
    .split(/[\s,]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function TeamFormationForm({
  domain,
  minMembers,
  maxMembers,
  minSeniors,
  maxSeniors,
}: TeamFormationFormProps) {
  const [state, action] = useActionState(createTeam, {});
  const [name, setName] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Team created. Welcome to the grid.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      setEmails([]);
      setDraft("");
    }
  }, [state]);

  function addFromDraft() {
    const parts = splitEmails(draft);
    setDraft("");
    if (parts.length === 0) return;
    setEmails((prev) => Array.from(new Set([...prev, ...parts])));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault();
        addFromDraft();
      }
    } else if (e.key === "Backspace" && draft === "" && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (!/[\s,]/.test(text)) return;
    e.preventDefault();
    const parts = splitEmails(text);
    setEmails((prev) => Array.from(new Set([...prev, ...parts])));
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  const invalidEmails = useMemo(
    () => emails.filter((email) => !email.endsWith(`@${domain}`)),
    [emails, domain]
  );
  const rosterSize = 1 + emails.length;
  const rosterInRange = rosterSize >= minMembers && rosterSize <= maxMembers;
  const canSubmit = name.trim().length > 0 && emails.length > 0 && invalidEmails.length === 0 && rosterInRange;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="emails" value={emails.join(",")} />

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
        <div className="flex items-center justify-between">
          <Label htmlFor="emails-draft">Teammate VIT emails</Label>
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              rosterInRange ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            {rosterSize}/{minMembers}-{maxMembers}
          </span>
        </div>

        <div className="flex min-h-16 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          {emails.map((email) => {
            const invalid = !email.endsWith(`@${domain}`);
            return (
              <Badge key={email} variant={invalid ? "destructive" : "secondary"} className="h-6 gap-1 py-1 pl-2">
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  aria-label={`Remove ${email}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
          <input
            id="emails-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={addFromDraft}
            placeholder={emails.length === 0 ? `one.email@${domain}` : "Add another..."}
            className="min-w-32 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {invalidEmails.length > 0 && (
          <p className="text-xs text-destructive">Not a @{domain} address: {invalidEmails.join(", ")}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1 py-1">
          <Users className="size-3" />
          {minMembers}-{maxMembers} members total
        </Badge>
        <Badge variant="outline" className="gap-1 py-1">
          <ShieldCheck className="size-3" />
          {minSeniors}-{maxSeniors} seniors
        </Badge>
      </div>

      <SubmitButton pendingLabel="Forming up..." disabled={!canSubmit} className="w-full">
        <Flag className="size-4" />
        Form team
      </SubmitButton>
    </form>
  );
}
