# app.mapchat.social — Email-Verified Landing Page (deployment kit)

This directory is a **staging area** for files that need to live in a separate GitHub repo serving `app.mapchat.social`. They are NOT part of the MapChat mobile app build.

## What's here

| File | Purpose |
|---|---|
| `auth/verified/index.html` | Email-verified success page. Tries `mapchatmobile://auth/verified` deep link on mobile after 1.5s; provides a manual "Return to App" button as fallback. |
| `index.html` | Root of `app.mapchat.social` — a `meta refresh` redirect to `https://mapchat.social` so the bare subdomain doesn't 404 if anyone hits it directly. |
| `CNAME` | GitHub Pages custom-domain marker. Contents: `app.mapchat.social`. |

## One-time deployment (Mayur)

### 1. Create the GitHub repo

1. Sign in to GitHub as `mayur-mapchat` (the org account, not `mayurdmehta`).
2. Create a new public repo: `mayur-mapchat/mapchat-app-landing` (or any name — only the URL `app.mapchat.social` matters publicly).
3. Initialize with a README so the default branch exists.

### 2. Copy these files into the new repo

Copy the **contents** of `handoffs/web-landing/` (this directory) into the root of the new repo, preserving the folder structure:

```
new-repo/
├── auth/
│   └── verified/
│       └── index.html
├── index.html
└── CNAME
```

Commit and push to `main`.

### 3. Enable GitHub Pages

1. In the new repo, go to **Settings → Pages**.
2. Source: **Deploy from a branch** → Branch: `main` / Folder: `/ (root)` → Save.
3. After ~1 minute, GitHub will report "Your site is live at `https://mayur-mapchat.github.io/mapchat-app-landing/`".

### 4. Configure DNS at Cloudflare

Mapchat.social DNS is currently at Cloudflare (per `nslookup` 2026-05-08). Add ONE record:

| Type | Name | Target | Proxy status |
|---|---|---|---|
| `CNAME` | `app` | `mayur-mapchat.github.io` | DNS only (gray cloud, NOT proxied — GitHub serves its own SSL cert) |

**Important:** Set proxy status to "DNS only" (gray cloud). Proxying through Cloudflare's orange cloud will conflict with GitHub Pages' Let's Encrypt SSL certificate provisioning.

After ~5-15 min for DNS propagation:
- `nslookup app.mapchat.social 8.8.8.8` should resolve to a GitHub Pages IP (185.199.108.153 or similar).

### 5. Set the custom domain in GitHub Pages

1. Back in the GitHub repo's **Settings → Pages**.
2. Under **Custom domain**, enter `app.mapchat.social` and click Save.
3. Wait ~5-10 min for GitHub to provision a Let's Encrypt SSL cert.
4. Tick **Enforce HTTPS** once the cert is ready.

### 6. Add the redirect URL to Supabase

1. Supabase Dashboard → Project (`sfxhzmniyfvrmprjzmsj`) → Authentication → URL Configuration.
2. Under **Redirect URLs**, add: `https://app.mapchat.social/auth/verified`.
3. Save.

### 7. Smoke-test

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
