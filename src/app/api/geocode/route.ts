import { NextResponse } from "next/server";
import { searchAddress } from "@/lib/geocode";

// Address autocomplete proxy (so the browser never calls Nominatim directly —
// keeps the required User-Agent + caching on our side). GET /api/geocode?q=...
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchAddress(q, 5);
  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
