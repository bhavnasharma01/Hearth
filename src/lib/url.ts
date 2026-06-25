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
