"use client";

import { useRef, useState } from "react";

interface Suggestion {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Address field with type-ahead suggestions (via /api/geocode). Picking a
 * suggestion captures precise coordinates in hidden lat/lng fields; free-typing
 * still works (the server geocodes the text on submit). Submits `location_text`.
 */
export function AddressAutocomplete({
  inputClassName,
}: {
  inputClassName: string;
}) {
  const [value, setValue] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    setCoords(null); // typing invalidates a previously-picked coordinate
    clearTimeout(timer.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(v)}`);
        const json = (await res.json()) as { results?: Suggestion[] };
        setSuggestions(json.results ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 350);
  }

  function pick(s: Suggestion) {
    setValue(s.label);
    setCoords({ lat: s.lat, lng: s.lng });
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        name="location_text"
        value={value}
        onChange={onChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        placeholder="Start typing an address or venue…"
        className={inputClassName}
      />
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
      {coords && (
        <p className="mt-1 text-xs text-forest">✓ location pinned for “near me”</p>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-card shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-sand"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
