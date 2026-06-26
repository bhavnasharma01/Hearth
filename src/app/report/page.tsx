import type { Metadata } from "next";
import { ReportForm } from "@/components/forms/report-form";
import { getSupabaseServer } from "@/lib/supabase/server";
import { firstParam } from "@/lib/url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report a listing — Hearth",
};

async function getTargetLabel(
  type: "practitioner" | "event",
  id: string,
): Promise<string | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  if (type === "practitioner") {
    const { data } = await supabase
      .from("practitioners")
      .select("name, practice_name")
      .eq("id", id)
      .maybeSingle();
    return data ? data.practice_name || data.name : null;
  }
  const { data } = await supabase
    .from("events")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  return data?.title ?? null;
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawType = firstParam(sp.type);
  const id = firstParam(sp.id);
  const type: "practitioner" | "event" =
    rawType === "event" ? "event" : "practitioner";

  const valid = Boolean(id);
  const targetLabel = valid ? await getTargetLabel(type, id!) : null;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Report a listing
      </h1>
      <p className="mt-1 text-sm text-muted">
        Help keep Hearth trustworthy — flag anything that looks off.
      </p>

      <div className="mt-6">
        {valid ? (
          <ReportForm type={type} id={id!} targetLabel={targetLabel} />
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
            This report link is missing its target. Please use the “Report” link
            on a specific listing or event.
          </p>
        )}
      </div>
    </div>
  );
}
