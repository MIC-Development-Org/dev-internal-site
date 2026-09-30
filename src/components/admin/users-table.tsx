"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Award, UserCog, X } from "lucide-react";
import { bulkAwardPoints, bulkSetRole } from "@/lib/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { RoleSelectForm } from "@/components/admin/role-select-form";
import { USER_ROLES, type UserRole } from "@/lib/constants/roles";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
  batch?: string;
  points: number;
  role: UserRole;
  teamId: string | null;
};

const ROLE_LABELS: Record<UserRole, string> = {
  lead: "Department Lead",
  senior: "Senior Member",
  fresher: "Junior Member",
};

function SelectBox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="size-4 cursor-pointer accent-[var(--primary)]"
    />
  );
}

/**
 * Admin member table with row selection and bulk actions. The column headers (sortable links)
 * are rendered by the server page and passed in as `header`.
 */
export function UsersTable({ users, header }: { users: AdminUser[]; header: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = users.length > 0 && users.every((u) => selected.has(u._id));

  // Drop selections that are no longer on screen (after paging, searching or sorting).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected((prev) => {
      const visible = new Set(users.map((u) => u._id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [users]);

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const toggleAll = (on: boolean) => setSelected(on ? new Set(users.map((u) => u._id)) : new Set());

  return (
    <div className="space-y-4">
      {selected.size > 0 && <BulkBar ids={[...selected]} onClear={() => setSelected(new Set())} />}

      {users.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No members match these filters.
        </p>
      ) : (
        <>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <th className="w-10 px-2">
                  <SelectBox checked={allSelected} onChange={toggleAll} label="Select all members on this page" />
                </th>
                {header}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id} data-state={selected.has(u._id) ? "selected" : undefined}>
                  <TableCell className="w-10 px-2">
                    <SelectBox checked={selected.has(u._id)} onChange={(v) => toggle(u._id, v)} label={`Select ${u.name}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={u.photoUrl} alt={u.name} />
                        <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {u.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.batch || "—"}</TableCell>
                  <TableCell className="tabular-nums">{u.points}</TableCell>
                  <TableCell>
                    <RoleSelectForm userId={u._id} role={u.role} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.teamId ? "Assigned" : "Unassigned"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Stacked cards below md, so nothing gets clipped on phones */}
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <Card key={u._id} className={selected.has(u._id) ? "border-primary" : undefined}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center gap-3">
                    <SelectBox checked={selected.has(u._id)} onChange={(v) => toggle(u._id, v)} label={`Select ${u.name}`} />
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.photoUrl} alt={u.name} />
                      <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide">Batch</p>
                      <p className="text-foreground">{u.batch || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide">Points</p>
                      <p className="tabular-nums text-foreground">{u.points}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide">Team</p>
                      <p className="text-foreground">{u.teamId ? "Assigned" : "Unassigned"}</p>
                    </div>
                  </div>
                  <RoleSelectForm userId={u._id} role={u.role} />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BulkBar({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const [awardState, awardAction] = useActionState(bulkAwardPoints, {});
  const [roleState, roleAction] = useActionState(bulkSetRole, {});
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [role, setRole] = useState<UserRole>("fresher");

  useEffect(() => {
    if (awardState.error && !awardState.fieldErrors) toast.error(awardState.error);
    if (awardState.success) {
      toast.success(`Points applied to ${ids.length} members.`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmount("");
      setReason("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awardState]);

  useEffect(() => {
    if (roleState.error && !roleState.fieldErrors) toast.error(roleState.error);
    if (roleState.success) toast.success(`Role updated for ${ids.length} members.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleState]);

  const hidden = ids.map((id) => <input key={id} type="hidden" name="userIds" value={id} />);

  return (
    <div className="surface sticky top-2 z-20 space-y-3 border-primary/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">{ids.length} selected</p>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} className="h-7 gap-1 text-xs">
          <X className="size-3.5" /> Clear
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <form action={awardAction} className="flex flex-wrap items-start gap-2">
          {hidden}
          <Award className="mt-2 size-4 text-muted-foreground" />
          <div className="w-24 space-y-1">
            <Input
              name="amount"
              type="number"
              placeholder="± pts"
              aria-label="Points (negative to deduct)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={Boolean(awardState.fieldErrors?.amount)}
              aria-describedby={awardState.fieldErrors?.amount ? "bulk-amount-error" : undefined}
            />
            <FieldError id="bulk-amount" message={awardState.fieldErrors?.amount} />
          </div>
          <div className="min-w-40 flex-1 space-y-1">
            <Input
              name="reason"
              placeholder="Reason (internal)"
              aria-label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-invalid={Boolean(awardState.fieldErrors?.reason)}
              aria-describedby={awardState.fieldErrors?.reason ? "bulk-reason-error" : undefined}
            />
            <FieldError id="bulk-reason" message={awardState.fieldErrors?.reason} />
          </div>
          <SubmitButton pendingLabel="Applying..." size="sm">
            Award
          </SubmitButton>
        </form>

        <form action={roleAction} className="flex flex-wrap items-start gap-2">
          {hidden}
          <UserCog className="mt-2 size-4 text-muted-foreground" />
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            aria-label="New role"
            className="h-9 min-w-40 flex-1 rounded-md border border-input bg-background px-2 text-sm"
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <SubmitButton pendingLabel="Updating..." size="sm" variant="outline">
            Set role
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
