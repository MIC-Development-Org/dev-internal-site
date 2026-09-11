import { getAllUsersForAdmin } from "@/lib/data/users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Table for md+ screens */}
      <Table className="hidden md:table">
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

      {/* Stacked cards below md, so nothing gets clipped on phones */}
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <Card key={u._id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
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
    </div>
  );
}
