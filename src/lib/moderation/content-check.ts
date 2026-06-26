// Lightweight content check for public submissions (see documentation/Security.md §4).
// Clean submissions publish instantly; suspicious ones are held as `pending` and
// the admin is notified. This is intentionally simple and conservative — it only
// holds the small risky fraction, never blocks legitimate posts.

export interface ContentCheckResult {
  result: "ok" | "needs_review";
  reasons: string[];
}

// Obvious spam / inappropriate signals. Word-boundary matched, case-insensitive.
const FLAGGED_TERMS = [
  "viagra",
  "cialis",
  "casino",
  "porn",
  "crypto giveaway",
  "forex",
  "make money fast",
  "work from home",
  "weight loss pills",
  "free bitcoin",
  "loan offer",
  "escort",
];

const URL_PATTERN = /https?:\/\/|www\.|\b\S+\.(com|net|org|io|co|ru|xyz|info)\b/gi;

/**
 * Run the check over the user-supplied free text of a submission.
 * @param texts the free-text fields to scan (description, bio, etc.)
 * @param maxUrls how many links are allowed before it's held for review
 */
export function runContentCheck(
  texts: Array<string | null | undefined>,
  maxUrls = 2,
): ContentCheckResult {
  const blob = texts.filter(Boolean).join("\n").toLowerCase();
  const reasons: string[] = [];

  for (const term of FLAGGED_TERMS) {
    const pattern = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
    if (pattern.test(blob)) {
      reasons.push(`flagged term: "${term}"`);
    }
  }

  const urlMatches = blob.match(URL_PATTERN);
  if (urlMatches && urlMatches.length > maxUrls) {
    reasons.push(`too many links (${urlMatches.length})`);
  }

  return { result: reasons.length > 0 ? "needs_review" : "ok", reasons };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
