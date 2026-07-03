import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/data/categories";
import { getPractitionerOptions } from "@/lib/data/practitioners";
import { EventForm } from "@/components/forms/event-form";
import { EVENTS_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add an event · Hearth",
  description: "Share a conscious event with the community. No account needed.",
};

export default async function AddEventPage() {
  // Events layer is hidden for the practitioner-only pilot (see @/lib/features).
  if (!EVENTS_ENABLED) notFound();

  const [categories, hosts] = await Promise.all([
    getCategories(),
    getPractitionerOptions(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Add an event
        </h1>
        <p className="mt-1 text-muted">
          Whether you’re hosting or attending, share it so more of us step into
          spaces of healing, growth, and connection.
        </p>
      </header>
      <EventForm categories={categories} hosts={hosts} />
    </div>
  );
}
