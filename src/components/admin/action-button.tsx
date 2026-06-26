// A tiny <form> + submit button that calls an admin server action with hidden
// fields. Server component (the action prop is a server action).

export function ActionButton({
  action,
  fields,
  children,
  variant = "default",
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  children: React.ReactNode;
  variant?: "default" | "primary" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "bg-forest text-cream hover:bg-forest-deep"
      : variant === "danger"
        ? "border border-clay/50 text-clay hover:bg-clay/10"
        : "border border-line text-forest hover:bg-sand";
  return (
    <form action={action} className="inline">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        className={`rounded-full px-3 py-1 text-xs transition-colors ${cls}`}
      >
        {children}
      </button>
    </form>
  );
}
