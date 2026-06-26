import type { Metadata } from "next";
import { getCategories } from "@/lib/data/categories";
import { EventForm } from "@/components/forms/event-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add an event — Hearth",
  description: "Share a conscious event with the community. No account needed.",
};

export default async function AddEventPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Add an event
        </h1>
        <p className="mt-1 text-muted">
          Whether you’re hosting or attending — share it so more of us step into
          spaces of healing, growth, and connection.
        </p>
      </header>
      <EventForm categories={categories} />
    </div>
  );
}
