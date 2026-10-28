# Dotnetklubben (dotnetklubben.org)

Official website for **Dotnetklubben** built with [Astro](https://astro.build/) and hosted on **Cloudflare Pages** — zero WordPress, zero databases, and zero tracking cookies.

## Project Structure

```text
src/
  layouts/Base.astro            # <head>, SEO/OpenGraph, self-hosted fonts, footer
  components/Header.astro       # Full-viewport hero header with logo and navigation
  components/Hero.astro         # Main article, two-column cards, and YouTube throwback
  components/CallToAction.astro # Community links (Discord, Facebook, Contact)
  components/Partners.astro     # Responsive partner logo carousel driven by partners.json
  components/ContactForm.astro  # Contact form with validation, 180-char counter, and honeypot
  content/nyheter/*.md          # Articles in Markdown (Astro Content Collections)
  data/partners.json            # Partner list (name, logo, url)
  pages/index.astro             # Home page
  pages/404.astro               # Custom 404 page
functions/
  api/kontakt.ts                # Cloudflare Pages Function (Resend + optional Turnstile)
public/
  fonts/                        # Self-hosted WOFF2 fonts (Roboto & Advent Pro)
  images/                       # Logos, hero background, and partner logos
  robots.txt                    # Search engine rules
  _redirects                    # Legacy WordPress URL redirects
```

## Editing Content

- **Main Article & Cards:** Edit [`src/content/nyheter/en-epoke-er-over.md`](src/content/nyheter/en-epoke-er-over.md).
- **Partners:** Add, remove, or update partners in [`src/data/partners.json`](src/data/partners.json) and place any new logo files in `public/images/partners/`.
- **Contact Form (Cloudflare Pages Function + Resend, with Web3Forms fallback):**
  The form submits to `/api/kontakt` ([`functions/api/kontakt.ts`](functions/api/kontakt.ts)), which sends emails from `Dotnetklubben <noreply@dotnetklubben.org>` to `kristian@rolandtech.org` via [Resend](https://resend.com).
  - Configure `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` in **Cloudflare Pages → Settings → Environment variables**.
  - Optional: Set `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to enable Cloudflare Turnstile spam protection.
  - If `RESEND_API_KEY` is not set, the form automatically falls back to Web3Forms (`PUBLIC_WEB3FORMS_ACCESS_KEY`).

## Local Development

```bash
npm install
npm run dev
```

Build static files to `dist/`:

```bash
npm run build
npm run preview
```

Deploy to Cloudflare Pages via Wrangler:

```bash
npx wrangler pages deploy dist --project-name dotnetklubben
```
