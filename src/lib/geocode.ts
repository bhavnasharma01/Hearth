import "server-only";

// Free geocoding via OpenStreetMap Nominatim. Biased to Canada (the community is
// Toronto-based) and rate-friendly: results are cached in-process, and we only
// geocode on write (submit / import / backfill), never on public reads.
//
// Nominatim usage policy: a descriptive User-Agent is required and traffic must
// be light (≤1 req/sec). Our volume (occasional submits + a small backfill +
// debounced autocomplete) is well within that.

const USER_AGENT =
  "Hearth Community Hub (https://github.com/bhavnasharma01/Hearth)";

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

const cache = new Map<string, GeocodeResult[]>();

/** Search an address/place and return up to `limit` matches (best first). */
export async function searchAddress(
  query: string,
  limit = 5,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const key = `${limit}:${q.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&addressdetails=0&countrycodes=ca&limit=${limit}&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;
    const results = data.map((d) => ({
      label: d.display_name,
      lat: Number.parseFloat(d.lat),
      lng: Number.parseFloat(d.lon),
    }));
    cache.set(key, results);
    return results;
  } catch {
    return [];
  }
}

// Venue-name prefixes and postal codes confuse Nominatim; try cleaner fallbacks.
function addressVariants(raw: string): string[] {
  const s = raw.trim();
  const noPostal = s
    .replace(/\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*$/, "")
    .trim();
  const parts = noPostal.split(",").map((p) => p.trim()).filter(Boolean);
  const venueStripped =
    parts.length >= 2 && !/\d/.test(parts[0]) && /\d/.test(parts[1])
      ? parts.slice(1).join(", ")
      : noPostal;
  const out = [venueStripped, noPostal, s];
  if (!/\d/.test(s) && !/canada/i.test(s)) out.push(`${s}, Ontario, Canada`);
  return [...new Set(out.filter(Boolean))];
}

/** Geocode a single address/place to its best coordinate match (or null),
 *  trying progressively simpler variants. */
export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  for (const variant of addressVariants(query)) {
    const results = await searchAddress(variant, 1);
    if (results[0]) return results[0];
  }
  return null;
}

/**
 * Coordinates for a submitted location, shared by the event + practitioner
 * server actions: prefer the precise coordinates the `AddressAutocomplete`
 * captured when the user picked a suggestion (hidden `latitude`/`longitude`
 * fields), and fall back to geocoding the free-typed text. Returns null if
 * neither yields a coordinate.
 */
export async function resolveCoordsFromForm(
  formData: FormData,
  text: string | null,
): Promise<{ lat: number; lng: number } | null> {
  const latRaw = formData.get("latitude")?.toString().trim();
  const lngRaw = formData.get("longitude")?.toString().trim();
  if (latRaw && lngRaw) {
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  if (text) {
    const g = await geocodeAddress(text);
    if (g) return { lat: g.lat, lng: g.lng };
  }
  return null;
}
