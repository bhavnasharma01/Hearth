# Google Sign-In Setup (Phase A of accounts)

*Click-by-click guide for Bhavna. This is the config half of bringing public accounts to Hearth (Google-only for the pilot; email/password waits for a verified domain). The code half (sign-in page, header control, RLS migration) ships separately.*

**Time needed:** about 20 minutes. **Cost:** $0.
**You'll touch two dashboards:** Google Cloud and Supabase.

---

## Before you start, one important rule

Do Parts 1 and 2 anytime, they're harmless on their own. **Do NOT do Part 3 (allowing sign-ups) until the app's migration `0008` has been run** (Claude will tell you when). Reason: today the database treats any signed-in user as an admin (that was fine while admins were the only people who *could* sign in). The migration removes that assumption. Flipping sign-ups on before it lands would hand every member admin-level data access.

---

## Part 1: Google Cloud (create the OAuth client)

Use your **personal Google account**, no new Gmail needed. This creates a "project" owned by your account; nothing sends from or touches your personal email.

1. Go to https://console.cloud.google.com and sign in.
2. Top bar → the project dropdown → **New project**. Name it `Hearth`. Create, then make sure it's selected.
3. Left menu → **APIs & Services** → **OAuth consent screen** (Google sometimes calls this "Google Auth Platform" → "Branding").
   - User type: **External** → Create.
   - App name: `Hearth` · User support email: your Gmail · Developer contact: your Gmail. Save through the steps.
   - Scopes: leave the defaults (we only use name + email, which are non-sensitive, so Google requires no verification review).
   - When offered, **Publish** the app (move it from "Testing" to "In production"). With only basic scopes there's no review process; this just removes the 100-test-user cap.
4. Left menu → **APIs & Services** → **Credentials** → **+ Create credentials** → **OAuth client ID**.
   - Application type: **Web application**. Name: `Hearth Supabase`.
   - Under **Authorized redirect URIs** → Add URI, paste exactly:
     ```
     https://lygcgrbdvmsqzmbhdlmv.supabase.co/auth/v1/callback
     ```
   - Create. A box shows your **Client ID** and **Client secret**. Keep this tab open (or copy both somewhere safe for the next 5 minutes).

---

## Part 2: Supabase (enable the Google provider)

1. Go to https://supabase.com/dashboard and open the Hearth project.
2. Left menu → **Authentication** → **Sign In / Providers** (older UI: "Providers").
3. Find **Google** → toggle it **on**.
   - Paste the **Client ID** and **Client secret** from Part 1.
   - The panel shows a "Callback URL"; confirm it matches what you pasted into Google in Part 1 (it should be the `…supabase.co/auth/v1/callback` address above).
   - Save.
4. Left menu → **Authentication** → **URL Configuration**:
   - **Site URL:** `https://www.myhearthapp.ca` (the canonical host — the apex redirects to www)
   - **Redirect URLs**, add all four (globs match paths, never subdomains — both www and apex forms are needed):
     ```
     https://www.myhearthapp.ca/**
     https://myhearthapp.ca/**
     https://hearthto.vercel.app/**
     http://localhost:3000/**
     ```
   - Save. (These tell Supabase where it's allowed to send people back to after Google sign-in: the live site and local dev.)

That's it for config. **No new Vercel environment variables**: the Google secret lives only inside Supabase, never in our code or on Vercel.

---

## Part 3: Allow public sign-ups — WAIT for the code

*Only after Claude confirms migration `0008` has been run in the SQL editor:*

1. **Authentication** → **Settings** (or "Sign In / Providers" → general settings).
2. Turn **"Allow new users to sign up" ON**.

The admin panel stays exactly as safe as today: admin access is governed by the `ADMIN_EMAILS` allowlist, not by "is signed in" (see `Security.md §2`), so members signing in gains them nothing on `/admin`.

**Email provider + SMTP:** originally left off; as of Build 54 (email/password shipped) they're configured per `Domain Setup.md` Parts 3–4.

---

## What happens after this

| Who | Does |
|---|---|
| Bhavna | Parts 1 + 2 above → tell Claude "Google config is done" |
| Claude | Ships Phase A code: migration `0008` (de-privilege `authenticated`), `/signin` page, header account control, session wiring, users-row on first sign-in |
| Bhavna | Runs migration `0008` in the Supabase SQL editor → then Part 3 |
| Together | Test: sign in with Google on the live site, then Phase B (claim + edit your listing from "My listing") |

## Troubleshooting

- **"redirect_uri_mismatch" from Google:** the URI in Part 1 step 4 doesn't exactly match Supabase's callback URL. Re-copy it, no trailing slash, `https://`.
- **"Access blocked: app not verified":** the consent screen is still in Testing. Publish it (Part 1 step 3), or add your tester's email under Test users as a stopgap.
- **Sign-in works locally but not on the live site:** the live URL is missing from Redirect URLs (Part 2 step 4).
