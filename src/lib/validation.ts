// Shared input validation for server actions. FormData values are untrusted:
// every id, number, date and free-text field is checked here before it reaches the database.

export const LIMITS = {
  name: 100,
  title: 120,
  description: 2000,
  note: 1000,
  reason: 200,
  shortText: 100,
  hobbies: 500,
  techItem: 40,
  techItems: 20,
  maxPoints: 10_000,
} as const;

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

/** Returns the id if it is a 24-char hex ObjectId string, otherwise null. */
export function parseObjectId(raw: FormDataEntryValue | null | undefined): string | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  return OBJECT_ID_RE.test(value) ? value : null;
}

/** Trimmed string from FormData ("" when missing or not a string). */
export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function withinLength(value: string, max: number): boolean {
  return value.length <= max;
}

/** Splits a comma/newline separated list, trimming, de-duplicating and dropping empties. */
export function parseList(raw: string, separator: RegExp = /,/): string[] {
  return Array.from(new Set(raw.split(separator).map((s) => s.trim()).filter(Boolean)));
}

/** Parses a tech-stack field; returns null if it exceeds the item count or item length limits. */
export function parseTechStack(raw: string): string[] | null {
  const items = parseList(raw);
  if (items.length > LIMITS.techItems) return null;
  if (items.some((t) => t.length > LIMITS.techItem)) return null;
  return items;
}

/** Parses a finite, non-zero integer within ±max, otherwise null. */
export function parsePointsAmount(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const amount = Number(raw);
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > LIMITS.maxPoints) return null;
  return amount;
}

/** Parses a date string; empty → null (cleared), invalid → undefined. */
export function parseOptionalDate(raw: string): Date | null | undefined {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Escapes a string for literal use inside a RegExp / `$regex`. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
