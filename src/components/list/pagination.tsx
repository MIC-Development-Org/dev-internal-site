import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildHref, type SearchParams } from "@/lib/list-params";
import { cn } from "@/lib/utils";

export function Pagination({
  path,
  params,
  page,
  totalPages,
  total,
  pageSize,
}: {
  path: string;
  params: SearchParams;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const linkClass =
    "inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs transition-colors hover:bg-muted";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-2">
      <p className="font-mono text-xs text-muted-foreground">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={buildHref(path, params, { page: page - 1 > 1 ? page - 1 : undefined })} className={linkClass}>
            <ChevronLeft className="size-3.5" /> Prev
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-40")}>
            <ChevronLeft className="size-3.5" /> Prev
          </span>
        )}
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={buildHref(path, params, { page: page + 1 })} className={linkClass}>
            Next <ChevronRight className="size-3.5" />
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-40")}>
            Next <ChevronRight className="size-3.5" />
          </span>
        )}
      </div>
    </nav>
  );
}
