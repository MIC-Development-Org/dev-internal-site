"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { Flag, ShieldCheck, Users, X, AlertTriangle, CircleUserRound } from "lucide-react";
import { cn } from "cn";
import { createTeam, lookupTeammate, type TeammateLookup } from "@/lib/actions/team";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { SubmitButton } from "@/components/submit-button";
import type { UserRole } from "@/lib/constants/roles";

type TeamFormationFormProps = {
  domain: string;
  minMembers: number;
  maxMembers: number;
  minSeniors: number;
  maxSeniors: number;
};

type LookupState =
  | { status: "loading" }
  | { status: "invalid_domain" }
  | { status: "not_found" }
  | { status: "error" }
  | ({ status: "found" } & Extract<TeammateLookup, { found: true }>);

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
  const [lookups, setLookups] = useState<Record<string, LookupState>>({});
  const requestId = useRef(0);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Team created successfully.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      setEmails([]);
      setDraft("");
      setLookups({});
    }
  }, [state]);

  function addEmails(newEmails: string[]) {
    setEmails((prev) => Array.from(new Set([...prev, ...newEmails])));
    for (const email of newEmails) {
      if (!email.endsWith(`@${domain}`)) {
        setLookups((prev) => ({ ...prev, [email]: { status: "invalid_domain" } }));
        continue;
      }
      setLookups((prev) => ({ ...prev, [email]: { status: "loading" } }));
      const id = ++requestId.current;
      lookupTeammate(email)
        .then((result) => {
          setLookups((prev) => {
            // Ignore stale responses for an email that was removed/re-added.
            if (id !== requestId.current && prev[email]?.status !== "loading") return prev;
            return {
              ...prev,
              [email]: result.found ? { status: "found", ...result } : { status: "not_found" },
            };
          });
        })
        .catch(() => {
          setLookups((prev) => ({ ...prev, [email]: { status: "error" } }));
        });
    }
  }

  function addFromDraft() {
    const parts = splitEmails(draft);
    setDraft("");
    if (parts.length === 0) return;
    addEmails(parts);
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
    addEmails(splitEmails(text));
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
    setLookups((prev) => {
      const next = { ...prev };
      delete next[email];
      return next;
    });
  }

  const invalidEmails = useMemo(
    () => emails.filter((email) => !email.endsWith(`@${domain}`)),
    [emails, domain]
  );
  const onAnotherTeamEmails = useMemo(
    () => emails.filter((email) => {
      const l = lookups[email];
      return l?.status === "found" && l.onAnotherTeam;
    }),
    [emails, lookups]
  );
  const notFoundEmails = useMemo(
    () => emails.filter((email) => lookups[email]?.status === "not_found"),
    [emails, lookups]
  );
  const pendingLookups = useMemo(
    () => emails.some((email) => lookups[email]?.status === "loading"),
    [emails, lookups]
  );
  const teamSize = 1 + emails.length;
  const teamSizeInRange = teamSize >= minMembers && teamSize <= maxMembers;
  const canSubmit =
    name.trim().length > 0 &&
    emails.length > 0 &&
    invalidEmails.length === 0 &&
    notFoundEmails.length === 0 &&
    onAnotherTeamEmails.length === 0 &&
    !pendingLookups &&
    teamSizeInRange;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="emails" value={emails.join(",")} />

      <div className="space-y-1.5">
        <Label htmlFor="name">Team name</Label>
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
              teamSizeInRange ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            {teamSize}/{minMembers}-{maxMembers}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your team must have {minMembers}-{maxMembers} members, including {minSeniors}-{maxSeniors} senior
          members.
        </p>

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
          <p className="text-xs text-destructive">
            Not a @{domain} address: {invalidEmails.join(", ")}
          </p>
        )}

        {emails.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {emails
              .filter((email) => email.endsWith(`@${domain}`))
              .map((email) => {
                const lookup = lookups[email];
                if (!lookup) return null;

                if (lookup.status === "loading") {
                  return (
                    <div key={email} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground">
                      <div className="size-6 shrink-0 animate-pulse rounded-full bg-muted" />
                      Checking {email}...
                    </div>
                  );
                }

                if (lookup.status === "not_found") {
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive"
                    >
                      <AlertTriangle className="size-3.5 shrink-0" />
                      Member not found. Please check the VIT email address ({email}).
                    </div>
                  );
                }

                if (lookup.status === "error") {
                  return (
                    <div key={email} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground">
                      <CircleUserRound className="size-3.5 shrink-0" />
                      Couldn&apos;t check {email} right now.
                    </div>
                  );
                }

                if (lookup.status === "found" && lookup.onAnotherTeam) {
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive"
                    >
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={lookup.photoUrl} alt={lookup.name} />
                        <AvatarFallback className="text-[10px]">{lookup.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>
                        <span className="font-medium">{lookup.name}</span> is already part of another team.
                      </span>
                    </div>
                  );
                }

                if (lookup.status === "found") {
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1.5 text-xs"
                    >
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={lookup.photoUrl} alt={lookup.name} />
                        <AvatarFallback className="text-[10px]">{lookup.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{lookup.name}</span>
                      <RoleBadge role={lookup.role as UserRole} className="ml-auto" />
                    </div>
                  );
                }

                return null;
              })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1 py-1">
          <Users className="size-3" />
          {minMembers}-{maxMembers} members total
        </Badge>
        <Badge variant="outline" className="gap-1 py-1">
          <ShieldCheck className="size-3" />
          {minSeniors}-{maxSeniors} senior members
        </Badge>
      </div>

      <SubmitButton pendingLabel="Creating team..." disabled={!canSubmit} className="w-full">
        <Flag className="size-4" />
        Create Team
      </SubmitButton>
    </form>
  );
}
