// Hand-authored types for the Hearth v1 schema.
// Mirrors supabase/migrations/0001_initial_schema.sql. When the live Supabase
// project exists we can additionally generate types via the Supabase CLI, but
// these keep the app fully typed today.

export type ListingMode = "in_person" | "online" | "both";
export type PractitionerStatus = "pending" | "live" | "hidden" | "rejected";
export type AutoCheckResult = "ok" | "needs_review";
export type PractitionerSource = "hearth_form" | "import" | "whatsapp" | "manual";
export type EventStatus = "pending" | "live" | "hidden" | "cancelled";
export type EventSource = "hearth_form" | "google_calendar" | "whatsapp" | "manual";
export type ReportReason = "spam" | "inappropriate" | "not_real" | "outdated" | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  active: boolean;
}

export interface Practitioner {
  id: string;
  owner_user_id: string | null;
  name: string;
  practice_name: string | null;
  slug: string;
  description: string;
  bio: string | null;
  area: string | null;
  mode: ListingMode;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  photo_url: string | null;
  pricing_note: string | null;
  languages: string | null;
  keywords: string | null;
  is_member: boolean;
  accepting_clients: boolean;
  status: PractitionerStatus;
  auto_check: AutoCheckResult;
  flag_count: number;
  featured: boolean;
  source: PractitionerSource;
  latitude: number | null;
  longitude: number | null;
  geocoded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A practitioner row joined with its categories (as the directory renders it). */
export interface PractitionerWithCategories extends Practitioner {
  categories: Category[];
  /** Distance from the visitor in km when a "near me" location is active. */
  distance_km?: number | null;
}

export interface Event {
  id: string;
  host_practitioner_id: string | null;
  submitted_by_user_id: string | null;
  recurrence_parent_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  registration_link: string | null;
  start_at: string;
  end_at: string | null;
  location_text: string | null;
  mode: ListingMode;
  host_name: string | null;
  cost_note: string | null;
  image_url: string | null;
  recurrence_rule: string | null;
  status: EventStatus;
  featured: boolean;
  source: EventSource;
  external_id: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** An event row joined with its (optional) category. */
export interface EventWithCategory extends Event {
  category: Category | null;
  /** Distance from the visitor in km when a "near me" location is active. */
  distance_km?: number | null;
}

export type FeedbackType = "bug" | "idea" | "confusing" | "praise" | "other";
export type FeedbackStatus =
  | "new"
  | "reviewing"
  | "planned"
  | "done"
  | "declined";
export type FeedbackPriority = "low" | "medium" | "high";

/** A private feedback item from the user-testing phase (admin-only). */
export interface Feedback {
  id: string;
  message: string;
  type: FeedbackType;
  context: string | null;
  submitter_name: string | null;
  submitter_contact: string | null;
  status: FeedbackStatus;
  priority: FeedbackPriority | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}
