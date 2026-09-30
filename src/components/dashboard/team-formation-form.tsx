"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { Flag, X, AlertTriangle, CircleUserRound, CheckCircle2, Circle, UserPlus } from "lucide-react";
import { cn } from "cn";
import { createTeam, lookupTeammate, type TeammateLookup } from "@/lib/actions/team";
import { Input } from "@/components/ui/input";
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
  me: { name: string; photoUrl?: string; role?: UserRole };
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
  me,
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
  const seniorCount =
    (me.role === "senior" ? 1 : 0) +
    emails.filter((email) => {
      const l = lookups[email];
      return l?.status === "found" && l.role === "senior";
    }).length;
  const seniorsInRange = seniorCount >= minSeniors && seniorCount <= maxSeniors;
  const canSubmit =
    name.trim().length > 0 &&
    emails.length > 0 &&
    invalidEmails.length === 0 &&
    notFoundEmails.length === 0 &&
    onAnotherTeamEmails.length === 0 &&
    !pendingLookups &&
    teamSizeInRange &&
    seniorsInRange;

  const allVerified =
    emails.length > 0 &&
    invalidEmails.length === 0 &&
    notFoundEmails.length === 0 &&
    onAnotherTeamEmails.length === 0 &&
    !pendingLookups;

  const checks = [
    { label: "Team name", ok: name.trim().length > 0, detail: name.trim() || "Not set" },
    { label: "Drivers", ok: teamSizeInRange, detail: `${teamSize} / ${minMembers}-${maxMembers}` },
    { label: "Senior members", ok: seniorsInRange, detail: `${seniorCount} / ${minSeniors}-${maxSeniors}` },
    { label: "All teammates verified", ok: allVerified, detail: pendingLookups ? "Checking..." : "" },
  ];

  const emptySlots = Math.max(0, maxMembers - teamSize);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <input type="hidden" name="emails" value={emails.join(",")} />

      {/* Left: garage setup */}
      <div className="space-y-6">
        <section className="surface space-y-3 p-5">
          <StepHeader step={1} title="Name your team" />
          <Input
            id="name"
            name="name"
            placeholder="e.g. Scuderia Byte"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 font-condensed text-xl font-semibold uppercase tracking-wide placeholder:normal-case placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal"
          />
        </section>

        <section className="surface space-y-3 p-5">
          <StepHeader step={2} title="Sign your drivers" />
          <p className="text-xs text-muted-foreground">
            Add teammates by their @{domain} email. Press Enter, comma, or paste a list.
          </p>

          <div className="flex w-full items-center gap-2 rounded-lg border border-input px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <UserPlus className="size-4 shrink-0 text-muted-foreground" />
            <input
              id="emails-draft"
              aria-label="Teammate VIT email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={addFromDraft}
              placeholder={`teammate@${domain}`}
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={addFromDraft}
              disabled={!draft.trim()}
              className="rounded-md bg-muted px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground transition-opacity disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {emails.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No teammates added yet.
            </p>
          )}
        </section>
      </div>

      {/* Right: grid lineup + checklist */}
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-condensed text-lg font-bold uppercase tracking-wide">Grid lineup</span>
            <span
              className={cn(
                "font-mono text-xs tabular-nums",
                teamSizeInRange ? "text-emerald-500" : "text-muted-foreground"
              )}
            >
              {teamSize}/{maxMembers}
            </span>
          </div>
          <ol className="divide-y divide-border/60">
            <Slot index={1}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={me.photoUrl} alt={me.name} />
                <AvatarFallback className="text-[10px]">{me.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {me.name} <span className="text-xs text-primary">(you)</span>
              </span>
            </Slot>

            {emails.map((email, i) => (
              <Slot key={email} index={i + 2} tone={slotTone(email, lookups[email], domain)}>
                <SlotBody email={email} lookup={lookups[email]} domain={domain} />
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  aria-label={`Remove ${email}`}
                  className="rounded-full p-1 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </Slot>
            ))}

            {Array.from({ length: emptySlots }, (_, i) => (
              <Slot key={`empty-${i}`} index={teamSize + i + 1} empty>
                <span className="text-xs text-muted-foreground">
                  {teamSize + i + 1 <= minMembers ? "Required seat" : "Optional seat"}
                </span>
              </Slot>
            ))}
          </ol>
        </section>

        <section className="surface space-y-4 p-4">
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm">
                {c.ok ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className={cn(!c.ok && "text-muted-foreground")}>{c.label}</span>
                {c.detail && (
                  <span className="ml-auto max-w-[9rem] truncate font-mono text-xs tabular-nums text-muted-foreground">
                    {c.detail}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <SubmitButton pendingLabel="Creating team..." disabled={!canSubmit} className="h-11 w-full">
            <Flag className="size-4" />
            Lights out — Create Team
          </SubmitButton>
        </section>
      </aside>
    </form>
  );
}

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-condensed text-3xl font-extrabold italic leading-none text-primary">0{step}</span>
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">{title}</h2>
    </div>
  );
}

type SlotTone = "ok" | "error" | "neutral";

function slotTone(email: string, lookup: LookupState | undefined, domain: string): SlotTone {
  if (!email.endsWith(`@${domain}`)) return "error";
  if (!lookup || lookup.status === "loading" || lookup.status === "error") return "neutral";
  if (lookup.status === "not_found" || (lookup.status === "found" && lookup.onAnotherTeam)) return "error";
  return "ok";
}

function Slot({
  index,
  empty,
  tone = "neutral",
  children,
}: {
  index: number;
  empty?: boolean;
  tone?: SlotTone;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "relative flex items-center gap-3 px-4 py-2.5",
        tone === "error" && "bg-destructive/5",
        empty && "opacity-60"
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          tone === "ok" && "bg-emerald-500",
          tone === "error" && "bg-destructive"
        )}
      />
      <span className="w-6 shrink-0 font-condensed text-lg font-extrabold italic tabular-nums text-muted-foreground">
        {index}
      </span>
      {empty ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-border" />
      ) : null}
      {children}
    </li>
  );
}

function SlotBody({ email, lookup, domain }: { email: string; lookup?: LookupState; domain: string }) {
  if (!email.endsWith(`@${domain}`)) {
    return <SlotMessage icon={<AlertTriangle className="size-3.5" />} title={email} note={`Not a @${domain} address`} error />;
  }
  if (!lookup || lookup.status === "loading") {
    return (
      <>
        <div className="size-7 shrink-0 animate-pulse rounded-full bg-muted" />
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Checking {email}...</span>
      </>
    );
  }
  if (lookup.status === "not_found") {
    return <SlotMessage icon={<AlertTriangle className="size-3.5" />} title={email} note="Member not found" error />;
  }
  if (lookup.status === "error") {
    return <SlotMessage icon={<CircleUserRound className="size-3.5" />} title={email} note="Couldn't check right now" />;
  }
  if (lookup.status === "found") {
    return (
      <>
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={lookup.photoUrl} alt={lookup.name} />
          <AvatarFallback className="text-[10px]">{lookup.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{lookup.name}</p>
          {lookup.onAnotherTeam ? (
            <p className="text-[11px] text-destructive">Already on another team</p>
          ) : (
            lookup.role && <RoleBadge role={lookup.role as UserRole} className="mt-0.5 h-4 px-1.5 text-[9px]" />
          )}
        </div>
      </>
    );
  }
  return null;
}

function SlotMessage({
  icon,
  title,
  note,
  error,
}: {
  icon: ReactNode;
  title: string;
  note: string;
  error?: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted",
          error ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs">{title}</p>
        <p className={cn("text-[11px]", error ? "text-destructive" : "text-muted-foreground")}>{note}</p>
      </div>
    </>
  );
}
