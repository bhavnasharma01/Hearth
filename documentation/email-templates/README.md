# Hearth email templates (Clementine & Juniper)

*The branded HTML for the Supabase auth emails. Bhavna pastes these in once; ~4 minutes.*

## How to install

1. Supabase dashboard → **Authentication** → **Email Templates**.
2. **Confirm signup**: set the subject to `Confirm your email · Hearth`, switch the body to the HTML source view, and paste the full contents of `confirm-signup.html`.
3. **Reset password**: subject `Reset your password · Hearth`, paste `reset-password.html`.
4. Save each. Send yourself a test (create a plus-address account / use Forgot password) and check it renders.

## Notes

- `{{ .ConfirmationURL }}` is Supabase's variable — leave it exactly as written; Supabase fills in the real link.
- The other templates (Magic link, Change email, Invite) aren't used by Hearth today; their defaults are fine.
- The **recommendation email** is NOT a Supabase template — the app sends it itself (`src/lib/email-html.ts` builds the same design; a plain-text part always accompanies it).
- **Reskin note:** email clients can't read the app's CSS tokens, so the palette hexes are hardcoded in these files and in `src/lib/email-html.ts` — a future palette change must update both (flagged in `Claude.md`).
- Accessibility: real text throughout (no image-only content), AA-checked colours (juniper button 7:1, body text 5.2:1), and a copyable fallback link under each button.
