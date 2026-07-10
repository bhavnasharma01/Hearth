# Domain Setup — myhearthapp.ca

*Click-by-click guide for Bhavna. The domain unlocks three things: a real address for launch, steward alerts that can reach any inbox (Resend), and, when we want it, email/password sign-in. Parts 1 and 2 make the site live on the domain; Part 3 unlocks email; Part 4 waits until we build email/password.*

**Order matters: do Part 1 first** — the app's links (emails, share buttons) already point at `https://myhearthapp.ca`, so the domain should start serving promptly.

---

## Part 1: Point the domain at the site (Vercel)

1. Vercel dashboard → the **Hearth** project → **Settings** → **Domains**.
2. **Add** `myhearthapp.ca`. When offered, also add `www.myhearthapp.ca` and accept Vercel's suggestion to redirect it to the apex.
3. **DNS lives at Porkbun (the registrar) — this is the settled decision.** Add the records Vercel shows for the domain (an **A record** for `@` and a **CNAME** for `www`, using the exact values from Vercel's dashboard) in Porkbun → Domain → DNS Records. All other records (Resend's in Part 3, DMARC, future ones) also go there.
   - ⚠️ **Never switch the domain's nameservers to Vercel** (`ns1/ns2.vercel-dns.com`). Doing so abandons the entire Porkbun zone — site records AND email records — and unless Vercel's own DNS zone is fully set up first, the domain goes dark. *This exact switch caused the July 10 outage (site unreachable, email records gone); reverting to Porkbun's default nameservers fixed it.*
4. Wait for the domain to show **Valid Configuration** in Vercel (minutes with Vercel DNS; nameserver changes can take up to a few hours). HTTPS certificates are automatic.
5. Test: open `https://myhearthapp.ca` — you should see Hearth. The old `hearthto.vercel.app` keeps working as an alias.

## Part 2: Tell Supabase about the new address

1. Supabase dashboard → **Authentication** → **URL Configuration**.
2. **Site URL:** change to `https://myhearthapp.ca`.
3. **Redirect URLs:** add `https://myhearthapp.ca/**` (keep `https://hearthto.vercel.app/**` and `http://localhost:3000/**`).
4. **Google Cloud needs no changes** — the OAuth callback points at Supabase's own address, which hasn't moved.
5. Test: sign in with Google on `https://myhearthapp.ca`.

## Part 3: Verify the domain in Resend (the email unlock)

*This lifts the "alerts only deliver to one inbox" limit and is the prerequisite for email/password sign-in.*

1. resend.com → **Domains** → **Add Domain** → `myhearthapp.ca` (default region is fine).
2. Resend shows a short list of **DNS records** (DKIM, SPF). Add each one where your DNS lives:
   - Nameservers on Vercel (Part 1 recommended path): Vercel → Domains → myhearthapp.ca → **DNS Records** → add each record exactly as shown.
   - Otherwise: add them in the registrar's DNS panel.
3. Back in Resend, click **Verify** and wait for the domain to show **Verified** (usually minutes).
4. In Vercel → Hearth project → **Settings** → **Environment Variables**, add:
   ```
   RESEND_FROM=Hearth <alerts@myhearthapp.ca>
   ```
   (Any address at the verified domain works for sending; it doesn't need an inbox behind it. If you ever want to *receive* replies there, set up email forwarding at your registrar — most offer it free.)
5. Optional but recommended once verified: set `NOTIFY_EMAILS` to a comma-separated list so Anat and Curtis get steward alerts too:
   ```
   NOTIFY_EMAILS=you@…, anat@…, curtis@…
   ```
6. **Redeploy** (Vercel → Deployments → ⋯ on the latest → Redeploy) so the new env vars take effect. Test: submit a junk practitioner listing with a spammy word, and the "held for review" alert should arrive from `alerts@myhearthapp.ca`.

## Part 4: Supabase SMTP — do this now (email/password shipped in Build 54)

*The email/password sign-in UI is built; this config switches it on.*

1. Supabase → **Project Settings** → **Authentication** (or Auth → Emails → SMTP settings): enable **Custom SMTP**.
2. Values: Host `smtp.resend.com` · Port `465` · Username `resend` · Password = your **Resend API key** · Sender email `alerts@myhearthapp.ca` · Sender name `Hearth`.
3. Then in Authentication → Sign In / Providers, enable the **Email** provider (leave **"Confirm email" ON** — it's what stops made-up addresses from creating accounts). Sign-up confirmation + password-reset emails will deliver via Resend.
4. Test on the live site: `/signin` → "Create an account" → the confirmation email should arrive from `alerts@myhearthapp.ca`; clicking it signs you in. Also try "Forgot your password?" end to end.

---

## What this unblocks, in order

| After | Hearth gains |
|---|---|
| Parts 1–2 | The site, sharing links, and Google sign-in all live on **myhearthapp.ca** (launch-ready address for the WhatsApp pinned post) |
| Part 3 | Steward alerts to **any inbox** (multiple admins), sent from the Hearth domain |
| Part 4 + a build session | **Email/password sign-in** for practitioners without Google |
