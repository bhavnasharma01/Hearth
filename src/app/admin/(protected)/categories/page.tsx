import { listCategoriesAdmin } from "@/lib/data/admin";
import {
  createCategory,
  renameCategory,
  setCategoryActive,
  deleteCategory,
} from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-xl border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-sage";

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [cats, { notice }] = await Promise.all([
    listCategoriesAdmin(),
    searchParams,
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        Shared by practitioners and events; listed alphabetically here and in
        the app. Rename freely (the web address stays stable, so links keep
        working). Delete removes an unused category; one that&rsquo;s in use can
        only be deactivated, which hides it without unlinking anyone.
      </p>

      {notice && (
        <p className="mb-5 rounded-xl border border-gold/40 bg-night px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      )}

      <form action={createCategory} className="mb-5 flex gap-2">
        <input name="name" placeholder="New category name" required className={`${inputCls} flex-1`} />
        <button
          type="submit"
          className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-cream hover:bg-forest-deep"
        >
          Add
        </button>
      </form>

      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
        {cats.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
            <form action={renameCategory} className="flex flex-1 items-center gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} className={`${inputCls} flex-1`} />
              <button
                type="submit"
                className="rounded-full border border-line px-3 py-1 text-xs text-forest hover:bg-sand"
              >
                Save
              </button>
            </form>
            <span className={`text-xs ${c.active ? "text-muted" : "text-clay"}`}>
              {c.active ? "active" : "inactive"}
            </span>
            <ActionButton
              action={setCategoryActive}
              fields={{ id: c.id, active: String(c.active) }}
            >
              {c.active ? "Deactivate" : "Activate"}
            </ActionButton>
            <ActionButton action={deleteCategory} fields={{ id: c.id }} variant="danger">
              Delete
            </ActionButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
