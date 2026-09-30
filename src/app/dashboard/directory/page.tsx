import { getDirectoryPage } from "@/lib/data/users";
import { USER_ROLES } from "@/lib/constants/roles";
import { DEFAULT_PAGE_SIZE, firstParam, parseEnum, parsePage } from "@/lib/list-params";
import { Pagination } from "@/components/list/pagination";
import { DirectoryView } from "./directory-view";

export default async function DirectoryPage({ searchParams }: PageProps<"/dashboard/directory">) {
  const params = await searchParams;
  const search = firstParam(params.q);
  const role = parseEnum(params.role, ["all", ...USER_ROLES] as const, "all");

  const { members, total } = await getDirectoryPage({
    search,
    role: role === "all" ? undefined : role,
    page: parsePage(params.page),
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const page = Math.min(parsePage(params.page), totalPages);

  return (
    <DirectoryView
      members={members}
      total={total}
      role={role}
      params={params}
      pagination={
        <Pagination
          path="/dashboard/directory"
          params={params}
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
        />
      }
    />
  );
}
