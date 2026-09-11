"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { setUserRole } from "@/lib/actions/admin";
import { USER_ROLES, type UserRole } from "@/lib/constants/roles";

export function RoleSelectForm({ userId, role }: { userId: string; role: UserRole }) {
  const [state, action] = useActionState(setUserRole, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Role updated.");
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
      >
        {USER_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </form>
  );
}
