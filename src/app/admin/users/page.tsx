import { ADMIN_USER_SORTS, getAdminUsersPage } from "@/lib/data/users";
import { USER_ROLES } from "@/lib/constants/roles";
import { firstParam, parseEnum, parsePage, buildHref } from "@/lib/list-params";
import { SearchBox } from "@/components/list/search-box";
import { SortHeader } from "@/components/list/sort-header";
import { Pagination } from "@/components/list/pagination";
import { TableHead } from "@/components/ui/table";
import { UsersTable } from "@/components/admin/users-table";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PATH = "/admin/users";
const PAGE_SIZE = 25;
const ROLE_FILTERS = ["all", ...USER_ROLES] as const;
const ROLE_LABELS: Record<(typeof ROLE_FILTERS)[number], string> = {
  all: "All",
  lead: "Leads",
  senior: "Seniors",
  fresher: "Juniors",
};

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const params = await searchParams;
  const search = firstParam(params.q);
  const role = parseEnum(params.role, ROLE_FILTERS, "all");
  const sort = parseEnum(params.sort, ADMIN_USER_SORTS, "name");
  const dir = parseEnum(params.dir, ["asc", "desc"] as const, "asc");
  const requestedPage = parsePage(params.page);

  const { users, total } = await getAdminUsersPage({
    search,
    role: role === "all" ? undefined : role,
    sort,
    dir,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const sortProps = { path: PATH, params, sort, dir };
  const filtered = Boolean(search) || role !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="text-sm text-muted-foreground">
          {total} {filtered ? "matching " : ""}member{total === 1 ? "" : "s"}. Select rows for bulk actions.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox placeholder="Search name, email or batch..." />
        <nav aria-label="Filter by role" className="flex flex-wrap items-center gap-1">
          {ROLE_FILTERS.map((r) => (
            <Link
              key={r}
              href={buildHref(PATH, params, { role: r === "all" ? undefined : r, page: undefined })}
              aria-current={role === r ? "true" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-3 text-xs transition-colors",
                role === r ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
              )}
            >
              {ROLE_LABELS[r]}
            </Link>
          ))}
        </nav>
      </div>

      <UsersTable
        users={users}
        header={
          <>
            <SortHeader label="Member" field="name" {...sortProps} />
            <SortHeader label="Email" field="email" {...sortProps} />
            <SortHeader label="Batch" field="batch" {...sortProps} />
            <SortHeader label="Points" field="points" {...sortProps} />
            <SortHeader label="Role" field="role" {...sortProps} />
            <TableHead>Team</TableHead>
          </>
        }
      />

      <Pagination path={PATH} params={params} page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
