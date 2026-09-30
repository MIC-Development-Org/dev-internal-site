// Validation for user-supplied project links. Only absolute http(s) URLs are
// accepted so values can't become `javascript:`/`data:` links when rendered.

const MAX_URL_LENGTH = 2048;

/** Returns the normalized URL if it is an absolute http(s) URL, otherwise null. */
export function parseHttpUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value || value.length > MAX_URL_LENGTH) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Returns the URL if it points at a GitHub repository (github.com/owner/repo), otherwise null. */
export function parseGithubRepoUrl(raw: string | null | undefined): string | null {
  const value = parseHttpUrl(raw);
  if (!value) return null;
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || (host !== "github.com" && host !== "www.github.com")) return null;
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  return owner && repo ? value : null;
}

/** Render-time guard for stored links: the URL if safe to use as an href, else null. */
export const safeHref = parseHttpUrl;
