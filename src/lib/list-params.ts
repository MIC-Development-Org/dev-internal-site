// Helpers for URL-driven list pages (search, filter, sort, pagination live in the query string
// so views are shareable and the back button works).

export type SearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_PAGE_SIZE = 24;

export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000) : 1;
}

/** Returns `value` if it is one of `allowed`, otherwise the fallback. */
export function parseEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  const v = firstParam(value) as T;
  return allowed.includes(v) ? v : fallback;
}

/** Builds `path?query` from the current params with overrides applied (empty/undefined overrides remove a key). */
export function buildHref(path: string, current: SearchParams, overrides: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, raw] of Object.entries(current)) {
    const v = firstParam(raw);
    if (v) query.set(key, v);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") query.delete(key);
    else query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  return { items: items.slice((current - 1) * pageSize, current * pageSize), page: current, totalPages, total: items.length };
}
