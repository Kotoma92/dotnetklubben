# Dotnetklubben (dotnetklubben.org)

Statisk nettside for **Dotnetklubben** bygget med [Astro](https://astro.build/) — uten WordPress, database eller unødvendige informasjonskapsler.

## Mappestruktur

```text
src/
  layouts/Base.astro          # <head>, SEO/OpenGraph, fonter, footer
  components/Header.astro     # Hero-header med logo og navigasjon
  components/Hero.astro       # Hovedartikkel, kort og YouTube-tilbakeblikk
  components/CallToAction.astro # Knapper til Discord, Facebook og Kontakt
  components/Partners.astro   # Partnerkarusell styrt fra partners.json
  components/ContactForm.astro# Kontaktskjema med validering, 180-tegnsgrense og honeypot
  content/nyheter/*.md        # Artikler i Markdown
  data/partners.json          # Samarbeidspartnere (navn, logo, url)
  pages/index.astro           # Forsiden
  pages/404.astro             # 404-side
public/
  fonts/                      # Selvhostede fonter (Roboto & Advent Pro)
  images/                     # Logoer, bakgrunnsbilde og partnerlogoer
  robots.txt                  # Søkemotorregler
  _redirects                  # Videresending av eldre WordPress-lenker
```

## Redigere innhold

- **Hovedartikkel og tekst:** Rediger [`src/content/nyheter/en-epoke-er-over.md`](src/content/nyheter/en-epoke-er-over.md).
- **Samarbeidspartnere:** Legg til, fjern eller endre partnere i [`src/data/partners.json`](src/data/partners.json) og legg eventuelle nye logoer i `public/images/partners/`.
- **Kontaktskjema (Web3Forms / Formspree):**
  Sett miljøvariabelen `PUBLIC_WEB3FORMS_ACCESS_KEY` (fra [Web3Forms](https://web3forms.com)) eller `PUBLIC_FORMSPREE_ENDPOINT` (fra [Formspree](https://formspree.io)) i Cloudflare Pages / Netlify (eller i `.env` lokalt, se `.env.example`).

## Utvikling lokalt

```bash
npm install
npm run dev
```

Bygg statiske filer til `dist/`:

```bash
npm run build
npm run preview
```
