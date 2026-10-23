# Digital Masterminds website: www.dmmkt.tech

Static site, ready for Cloudflare Pages. No build step is needed.

## What's in this folder

| Item | Purpose |
|---|---|
| `*.html` | 27 pages. Cloudflare Pages serves them at clean URLs (`/med-spas`, `/contact-us`, ...). |
| `assets/` | Images (WebP), self-hosted fonts (`assets/fonts/*.woff2`) and the share image. |
| `404.html` | Branded "page not found" page. |
| `robots.txt`, `sitemap.xml` | Search engine files, pointing at https://www.dmmkt.tech. |
| `_headers` | Security headers and browser caching for assets and fonts. |
| `_redirects` | Small redirects (`/index` and `/home` go to `/`). |
| `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` | Browser and phone icons. |

Every page has a meta description, a canonical URL on https://www.dmmkt.tech, and share tags for LinkedIn, Facebook and X. The homepage also has business details for Google: name, phone, email and Upper Montclair, NJ.

## Deploy

1. **GitHub:** create a repository (for example `dmmkt-site`) and upload the contents of this folder to the root of the repository. Upload what's inside the folder, not the folder itself.
2. **Cloudflare Pages:** go to Workers & Pages, then Create, then Pages, then Connect to Git, and pick the repository.
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **/**
3. **Custom domain:** in the Pages project, open Custom domains and add **www.dmmkt.tech**. Then add **dmmkt.tech** too, and create a Cloudflare Redirect Rule that sends `dmmkt.tech/*` to `https://www.dmmkt.tech/$1` with a 301.
4. **Internal page:** `internal-service-menu.html` is a team tool. It's already set to noindex, but put it behind **Cloudflare Zero Trust, then Access, then an application for `www.dmmkt.tech/internal-service-menu`** before launch, or delete the file from the repository.

## Before you go live

- [ ] Mailboxes or aliases exist for **info@**, **support@** and **do-not-contact@dmmkt.tech**. The Google Workspace MX records are set in Cloudflare DNS.
- [ ] HubSpot: add `www.dmmkt.tech` to the allowed domains for the contact form and tracking.
- [ ] LinkedIn Campaign Manager: confirm the Insight Tag domain is `www.dmmkt.tech`.
- [ ] Phone: test the "Call us" buttons, which dial +1 917 498 2737.
- [ ] Have counsel review the Privacy Policy, especially the recording-consent and retention sections. Make sure the voice agent opens each call with the recording notice.
- [ ] Consent banner: the LinkedIn tag currently loads without consent. Add a consent tool and keep `DMM-Cookie-Register.xlsx` and the table on `/cookies` up to date.

## After launch

- Submit `https://www.dmmkt.tech/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Run PageSpeed Insights and accessiBe accessScan on the live URL.
- To update the site: edit the files in GitHub. Cloudflare redeploys on every commit.
