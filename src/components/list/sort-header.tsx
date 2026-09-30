import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { buildHref, type SearchParams } from "@/lib/list-params";
import { TableHead } from "@/components/ui/table";

/** Table header cell that toggles `?sort=<field>&dir=asc|desc` and resets pagination. */
export function SortHeader({
  label,
  field,
  path,
  params,
  sort,
  dir,
}: {
  label: string;
  field: string;
  path: string;
  params: SearchParams;
  sort: string;
  dir: "asc" | "desc";
}) {
  const active = sort === field;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <Link
        href={buildHref(path, params, { sort: field, dir: nextDir, page: undefined })}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <Icon className={active ? "size-3.5" : "size-3.5 opacity-40"} />
      </Link>
    </TableHead>
  );
}
