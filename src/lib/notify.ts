import "server-only";
import nodemailer from "nodemailer";
import { adminEmails, parseEmails } from "@/lib/auth";

/**
 * Who receives steward alerts. Decoupled from admin-panel access: set
 * `NOTIFY_EMAILS` to control the alert recipients independently of who can log
 * in (`ADMIN_EMAILS`) — useful when several people can moderate but only some
 * should be emailed (and, on Resend's onboarding sender, so the recipient list
 * stays the single Resend-account inbox even as more admins are added). Falls
 * back to `ADMIN_EMAILS` when `NOTIFY_EMAILS` is unset, preserving prior behavior.
 */
function notifyEmails(): string[] {
  const explicit = parseEmails(process.env.NOTIFY_EMAILS);
  return explicit.length > 0 ? explicit : adminEmails();
}

/**
 * Admin email notifications (server-only).
 *
 * Sends a plain-text alert to every address in `ADMIN_EMAILS` for the two
 * "notify a human" moments the product promises: a submission held for review,
 * and a listing crossing the report threshold (documentation/Security.md §4–§5).
 *
 * Two transports are supported; it uses whichever is configured (no code change
 * to switch), preferring Resend when both are set:
 *
 *   1. **Resend** (`RESEND_API_KEY`) — the least-setup option. With the default
 *      sender (`onboarding@resend.dev`) there's no domain, no new email account,
 *      and no app password — but Resend only delivers to the email your Resend
 *      account is registered under, until you verify a domain (`RESEND_FROM`).
 *      Fine for a single-steward pilot; verify a domain to reach many admins.
 *   2. **Gmail SMTP** (`GMAIL_USER` + `GMAIL_APP_PASSWORD`) — send from a Gmail
 *      account you control via a Google App Password. No recipient limit, but
 *      needs an app password on a 2-Step-Verification account.
 *
 * Deliberately degrades gracefully: if neither is configured (local dev, or
 * before it's set in Vercel) it just logs to the server console instead of
 * sending, so the app builds and runs without credentials — the same "works
 * without env" pattern as the Supabase clients. It never throws: a failed
 * notification must never break a visitor's submission or report.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Resend's shared onboarding sender works with zero domain setup. Override with
// RESEND_FROM once a domain is verified (which also lifts the recipient limit).
const DEFAULT_RESEND_FROM = "Hearth <onboarding@resend.dev>";

export interface AdminNotification {
  subject: string;
  /** Plain-text body (kept simple — these are internal steward alerts). */
  body: string;
}

export async function notifyAdmins({
  subject,
  body,
}: AdminNotification): Promise<{ sent: boolean; reason?: string }> {
  const to = notifyEmails();
  if (to.length === 0) {
    console.warn(
      `notifyAdmins: no NOTIFY_EMAILS/ADMIN_EMAILS set; skipped "${subject}"`,
    );
    return { sent: false, reason: "no-recipients" };
  }

  if (process.env.RESEND_API_KEY) {
    return sendViaResend(to, subject, body);
  }
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return sendViaGmail(to, subject, body);
  }

  // Nothing configured — log so the alert is at least visible in dev/logs.
  console.warn(
    `notifyAdmins (no email provider configured, logging only) → ${to.join(", ")}\n${subject}\n${body}`,
  );
  return { sent: false, reason: "not-configured" };
}

async function sendViaResend(
  to: string[],
  subject: string,
  body: string,
): Promise<{ sent: boolean; reason?: string }> {
  const from = process.env.RESEND_FROM || DEFAULT_RESEND_FROM;
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text: body }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`notifyAdmins: Resend responded ${res.status}: ${detail}`);
      return { sent: false, reason: `http-${res.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error("notifyAdmins (resend):", (error as Error).message);
    return { sent: false, reason: "fetch-error" };
  }
}

async function sendViaGmail(
  to: string[],
  subject: string,
  body: string,
): Promise<{ sent: boolean; reason?: string }> {
  const user = process.env.GMAIL_USER!;
  // App passwords are shown by Google with spaces ("abcd efgh ijkl mnop"); Gmail
  // wants them with the spaces removed, so be forgiving about how it's pasted.
  const pass = process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "");
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      // Gmail rewrites the envelope sender to the authenticated account anyway;
      // the display name just makes the alert recognizable in the inbox.
      from: `Hearth <${user}>`,
      to,
      subject,
      text: body,
    });
    return { sent: true };
  } catch (error) {
    console.error("notifyAdmins (gmail):", (error as Error).message);
    return { sent: false, reason: "smtp-error" };
  }
}
