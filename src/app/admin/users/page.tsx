import { getAllUsersForAdmin } from "@/lib/data/users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleSelectForm } from "@/components/admin/role-select-form";

export default async function AdminUsersPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">{users.length} members registered.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={u.photoUrl} alt={u.name} />
                  <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {u.name}
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell className="text-muted-foreground">{u.batch || "—"}</TableCell>
              <TableCell className="tabular-nums">{u.points}</TableCell>
              <TableCell className="text-muted-foreground">{u.teamId ? "Assigned" : "Unassigned"}</TableCell>
              <TableCell>
                <RoleSelectForm userId={u._id} role={u.role} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
