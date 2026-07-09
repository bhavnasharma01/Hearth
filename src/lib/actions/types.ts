/** Shared result shape for submission server actions (used with useActionState). */
export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  /** True when the submission was held for a quick human review (not yet public). */
  pendingReview?: boolean;
  /** Slug of a newly created practitioner (for a "view your listing" link). */
  slug?: string;
}

export const INITIAL_FORM_STATE: FormState = { status: "idle", message: "" };
