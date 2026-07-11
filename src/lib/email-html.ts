import "server-only";

/**
 * Branded HTML for Hearth's outgoing member emails (Clementine & Juniper,
 * chosen 2026-07-10). Email clients need old-school inline-styled, table-based
 * HTML — no CSS variables — so the palette hexes are hardcoded HERE (and in
 * documentation/email-templates/ for the Supabase auth emails); update both
 * on any future reskin. Colours are AA-checked: juniper button #2f5d4c with
 * near-white text (7:1), ink #22392f, muted #5f7168 (5.2:1 on white).
 *
 * Accessibility: semantic heading, real text (no image-only content), left
 * meaning carried by words not colour, and a plain-text part is ALWAYS sent
 * alongside (sendEmail requires `body`).
 */

const JUNIPER = "#2f5d4c";
const CLEM = "#ef6c33";
const INK = "#22392f";
const MUTED = "#5f7168";
const LINE = "#eedfd2";
const PEACH = "#fff3ec";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface BrandedEmail {
  heading: string;
  /** Paragraphs of body text (plain strings; escaped here). */
  paragraphs: string[];
  /** Optional quoted block (e.g. the testimonial), with attribution. */
  quote?: { text: string; attribution: string };
  cta: { label: string; url: string };
  /** Small print under the button. */
  fine?: string;
}

export function brandedEmailHtml({
  heading,
  paragraphs,
  quote,
  cta,
  fine,
}: BrandedEmail): string {
  const paras = paragraphs
    .map(
      (p) =>
        `<p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${MUTED};">${escapeHtml(p)}</p>`,
    )
    .join("");
  const quoteBlock = quote
    ? `<div style="background:${PEACH};border-radius:10px;padding:14px 16px;margin:14px 0 0;text-align:left;">
         <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};font-style:italic;">&ldquo;${escapeHtml(quote.text)}&rdquo;</p>
         <p style="margin:6px 0 0;font-size:12.5px;color:${MUTED};">&mdash; ${escapeHtml(quote.attribution)}</p>
       </div>`
    : "";
  const finePrint = fine
    ? `<p style="margin:16px 0 0;font-size:11.5px;line-height:1.5;color:#8a9a91;">${escapeHtml(fine)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4efe9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid ${LINE};border-radius:14px;">
        <tr><td style="padding:26px 24px;text-align:center;font-family:Georgia,'Times New Roman',serif;">
          <img src="https://www.myhearthapp.ca/email-logo.png" width="36" height="36" alt="" style="display:block;margin:0 auto 6px;border:0;">
          <div style="font-size:20px;font-weight:700;color:${INK};">Hearth</div>
          <div style="height:1px;background:linear-gradient(to right,transparent,${CLEM},transparent);margin:12px 32px;"></div>
          <h1 style="margin:10px 0 0;font-size:20px;font-weight:600;color:${INK};font-family:Georgia,'Times New Roman',serif;">${escapeHtml(heading)}</h1>
          <div style="font-family:Helvetica,Arial,sans-serif;">
            ${paras}
            ${quoteBlock}
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:18px auto 0;"><tr><td style="border-radius:99px;background:${JUNIPER};">
              <a href="${cta.url}" style="display:inline-block;padding:11px 28px;font-size:14px;font-weight:700;color:#f2f7f4;text-decoration:none;font-family:Helvetica,Arial,sans-serif;">${escapeHtml(cta.label)}</a>
            </td></tr></table>
            ${finePrint}
          </div>
        </td></tr>
        <tr><td style="border-top:1px solid ${LINE};padding:12px;text-align:center;font-size:11px;color:#8a9a91;font-family:Helvetica,Arial,sans-serif;">
          Sent with care from Hearth &middot; <a href="https://www.myhearthapp.ca" style="color:${JUNIPER};">myhearthapp.ca</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
