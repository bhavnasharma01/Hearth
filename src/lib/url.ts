/** Build a `?a=1&b=2` query string, dropping empty/undefined values. */
export function buildQuery(
  params: Record<string, string | null | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Read a single string value from Next.js searchParams (ignores arrays). */
export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Absolute base URL of the deployed site, for links inside emails/notifications
 * (which can't use relative paths). Override with NEXT_PUBLIC_SITE_URL; defaults
 * to the production domain. Pass a path to get an absolute URL to it.
 */
export function siteUrl(path = ""): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://hearthto.vercel.app"
  ).replace(/\/$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
