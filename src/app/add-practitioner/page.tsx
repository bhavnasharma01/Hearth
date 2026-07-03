import type { Metadata } from "next";
import { getCategories } from "@/lib/data/categories";
import { PractitionerForm } from "@/components/forms/practitioner-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add your practice · Hearth",
  description: "Add yourself to the practitioner directory in about two minutes.",
};

export default async function AddPractitionerPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Add your practice
        </h1>
        <p className="mt-1 text-muted">
          Share what you offer. It takes about two minutes, and clean listings
          appear right away.
        </p>
      </header>
      <PractitionerForm categories={categories} />
    </div>
  );
}
