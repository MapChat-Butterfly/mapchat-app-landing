# app.mapchat.social — Email-Verified Landing Page (deployment kit)

This directory is the **staging copy** of files served at `app.mapchat.social` from the standalone repo `mapchat-butterfly/mapchat-app-landing` ([github.com/MapChat-Butterfly/mapchat-app-landing](https://github.com/MapChat-Butterfly/mapchat-app-landing)). They are NOT part of the MapChat mobile app build.

## What's here

| File | Purpose |
|---|---|
| `auth/verified/index.html` | Email-verified success page. Tries `mapchatmobile://auth/verified` deep link on mobile after 1.5s; provides a manual "Return to App" button as fallback. |
| `index.html` | Root of `app.mapchat.social` — a `meta refresh` redirect to `https://mapchat.social` so the bare subdomain doesn't 404 if anyone hits it directly. |
| `CNAME` | GitHub Pages custom-domain marker. Contents: `app.mapchat.social`. |

## Deployment status (2026-05-08)

| Step | Status | Owner |
|---|---|---|
| 1. Repo created — `mapchat-butterfly/mapchat-app-landing` | ✅ Done | Claude |
| 2. Files committed to `main` | ✅ Done | Claude |
| 3. GitHub Pages enabled (source = `main` / `/`, custom domain auto-read from CNAME file) | ✅ Done via API | Claude |
| 4. Cloudflare DNS CNAME `app → mapchat-butterfly.github.io` | ⏳ Pending | Mayur |
| 5. Let's Encrypt SSL provisions (auto, after DNS resolves) | ⏳ Pending DNS | Auto |
| 6. Enforce HTTPS toggle in Pages settings | ⏳ Pending SSL | Mayur |
| 7. Add `https://app.mapchat.social/auth/verified` to Supabase Auth → URL Configuration → Redirect URLs | ⏳ Pending | Mayur |
| 8. End-to-end smoke test | ⏳ Pending | Mayur |

## Remaining steps (Mayur)

### Step 4 — Configure DNS at Cloudflare

Mapchat.social DNS is currently at Cloudflare (per `nslookup` 2026-05-08). Add ONE record:

| Type | Name | Target | Proxy status |
|---|---|---|---|
| `CNAME` | `app` | `mapchat-butterfly.github.io` | DNS only (gray cloud, NOT proxied — GitHub serves its own SSL cert) |

**Important:** Set proxy status to "DNS only" (gray cloud). Proxying through Cloudflare's orange cloud will conflict with GitHub Pages' Let's Encrypt SSL certificate provisioning.

After ~5-15 min for DNS propagation:
- `nslookup app.mapchat.social 8.8.8.8` should resolve to a GitHub Pages IP (185.199.108.153 or similar).

### Step 6 — Enforce HTTPS

After DNS resolves and Let's Encrypt provisions the cert (~5-15 min after Step 4 lands):

1. Open `https://github.com/MapChat-Butterfly/mapchat-app-landing/settings/pages`.
2. Once the "Your site is live at https://app.mapchat.social/" banner appears with no warnings, tick **Enforce HTTPS**.

### Step 7 — Add the redirect URL to Supabase

1. Supabase Dashboard → Project (`sfxhzmniyfvrmprjzmsj`) → Authentication → URL Configuration.
2. Under **Redirect URLs**, add: `https://app.mapchat.social/auth/verified`.
3. Save.

### Step 8 — Smoke-test

1. Open `https://app.mapchat.social/auth/verified` in a desktop browser — should show "Email Verified!" with the "Continue" button hidden and the desktop copy.
2. Open the same URL on your phone — should show "Returning you to MapChat…" and after 1.5s prompt to open MapChat (assuming the dev client is installed).
3. Sign up a new test account in the app, click the email link → should land on `app.mapchat.social/auth/verified` and route back to the app.

## What's NOT included (deferred)

These are universal-link polish items — the static page works without them, the user just sees an extra OS prompt ("Open in MapChat?"). Pre-soft-launch this is acceptable.

| Item | When to do |
|---|---|
| Move `apple-app-site-association` + `assetlinks.json` to `app.mapchat.social/.well-known/` | When we want the email-link click to skip the browser entirely on iOS/Android |
| Update `app.config.js` `associatedDomains: ["applinks:app.mapchat.social"]` + Android `intentFilters.host` | Same time as above; requires fresh EAS build |
| Update `app.config.js` `experiments.baseUrl` | Only if we ever move the Expo web build off `mapchat-butterfly.github.io/mapchat` |

Logged in `LAUNCH_READINESS.md` §4 / BACKLOG when the time comes.

## Iteration

To change the page later, just edit `auth/verified/index.html` in the deployed repo and push to `main`. GitHub Pages redeploys in ~1 min. No build step.

## Data attribution

The city type-ahead on the waitlist form is powered by city data from
[GeoNames](https://www.geonames.org/) (geonames.org), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data lives
in the MapChat Supabase `city_directory` table (migrations 210/211).
