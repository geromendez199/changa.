/**
 * WHY: Prevent unsafe or broken auth redirects by only allowing internal application paths.
 * CHANGED: 2026-04-19
 */

export function sanitizeRedirectPath(redirect: string | null | undefined, fallback = "/home") {
  if (!redirect) return fallback;

  const normalized = redirect.trim();
  if (!normalized.startsWith("/")) return fallback;
  if (normalized.startsWith("//")) return fallback;
  if (/^\/login(?:$|[/?#])/.test(normalized)) return fallback;

  return normalized;
}
