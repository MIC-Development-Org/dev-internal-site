import Link from "next/link";
import { getDirectory } from "@/lib/data/users";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/models/User";

export default async function DirectoryPage({ searchParams }: PageProps<"/dashboard/directory">) {
  const params = await searchParams;
  const role = typeof params.role === "string" ? (params.role as UserRole) : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;

  const members = await getDirectory({ role, search });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Directory</h1>
        <p className="text-sm text-muted-foreground">Every member of the Development Department.</p>
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <Input name="search" placeholder="Search by name..." defaultValue={search} className="max-w-xs" />
        <Button type="submit" name="role" value="" variant={!role ? "default" : "outline"} size="sm">
          All
        </Button>
        <Button type="submit" name="role" value="senior" variant={role === "senior" ? "default" : "outline"} size="sm">
          Seniors
        </Button>
        <Button type="submit" name="role" value="fresher" variant={role === "fresher" ? "default" : "outline"} size="sm">
          Freshers
        </Button>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Link key={member._id} href={`/dashboard/directory/${member._id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex items-center gap-3 pt-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.photoUrl} alt={member.name} />
                  <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  {member.batch && <p className="text-xs text-muted-foreground">{member.batch}</p>}
                </div>
                <RoleBadge role={member.role} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
