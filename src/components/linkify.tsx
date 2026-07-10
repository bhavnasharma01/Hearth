/**
 * Render free text with any URLs inside it as safe, clickable links —
 * detection happens at DISPLAY time, so every existing profile benefits with
 * no data change (and the stored text stays exactly what the person typed).
 *
 * Safety: this never injects HTML (no dangerouslySetInnerHTML) — text is split
 * and URLs become real <a> elements. Only http(s):// and www. shapes are
 * linked; hrefs are always absolute https-style; rel includes `nofollow`
 * because this is user-supplied content.
 */

const URL_RE = /((?:https?:\/\/|www\.)[^\s<>]+)/gi;
// Punctuation that ends a sentence around a URL shouldn't be part of the link.
const TRAILING_PUNCT = /[).,;:!?'"”\]]+$/;

export function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) => {
        // With a single capture group, odd indices are the matched URLs.
        if (i % 2 === 0 || !part) return part || null;
        const trail = part.match(TRAILING_PUNCT)?.[0] ?? "";
        const url = trail ? part.slice(0, -trail.length) : part;
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="break-all text-forest underline hover:text-forest-deep"
            >
              {url}
            </a>
            {trail}
          </span>
        );
      })}
    </>
  );
}
