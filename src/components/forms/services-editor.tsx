"use client";

import { useState } from "react";
import type { PractitionerService } from "@/lib/types/database";

const inputCls =
  "rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

type Row = { key: number; title: string; description: string; price_note: string };

/**
 * A dynamic "what I offer" editor. Each row renders three parallel-named inputs
 * (`service_title` / `service_price` / `service_desc`) in the same order, so the
 * manage action can zip them by index with `getAll`. Rows with an empty title
 * are dropped on save.
 */
export function ServicesEditor({ initial }: { initial: PractitionerService[] }) {
  const [rows, setRows] = useState<Row[]>(
    initial.map((s, i) => ({
      key: i,
      title: s.title,
      description: s.description ?? "",
      price_note: s.price_note ?? "",
    })),
  );
  const [nextKey, setNextKey] = useState(initial.length);

  function add() {
    setRows((r) => [...r, { key: nextKey, title: "", description: "", price_note: "" }]);
    setNextKey((k) => k + 1);
  }
  function remove(key: number) {
    setRows((r) => r.filter((x) => x.key !== key));
  }
  function set(key: number, field: "title" | "description" | "price_note", value: string) {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, [field]: value } : x)));
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-xs text-muted">
          No services yet — add offerings like “60-min deep-tissue massage” with an
          optional price.
        </p>
      )}

      {rows.map((row) => (
        <div key={row.key} className="rounded-xl border border-line bg-sand/30 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="service_title"
              value={row.title}
              onChange={(e) => set(row.key, "title", e.target.value)}
              placeholder="Service (e.g. 60-min deep-tissue)"
              className={`${inputCls} flex-1`}
            />
            <input
              name="service_price"
              value={row.price_note}
              onChange={(e) => set(row.key, "price_note", e.target.value)}
              placeholder="$ / PWYC"
              className={`${inputCls} sm:w-32`}
            />
          </div>
          <input
            name="service_desc"
            value={row.description}
            onChange={(e) => set(row.key, "description", e.target.value)}
            placeholder="Optional — a short line about it"
            className={`${inputCls} mt-2 w-full`}
          />
          <button
            type="button"
            onClick={() => remove(row.key)}
            className="mt-1.5 text-xs text-muted underline hover:text-clay"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-full border border-line px-4 py-1.5 text-sm text-forest transition-colors hover:bg-sand"
      >
        + Add a service
      </button>
    </div>
  );
}
