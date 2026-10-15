# Jayson Wu personal site

Astro personal portfolio for `jaysonwu524.com`.

## Local development

```sh
npm install
npm run dev
```

## Content locations

- Shared page templates: `src/views/`
- UI translations and resume data: `src/i18n/ui.ts`, `src/i18n/resume.ts`
- Articles: `src/content/articles/*.md` (Simplified Chinese), `en/*.md`, `ja/*.md`
- Projects: `src/content/projects/*.md` (Simplified Chinese), `en/*.md`, `ja/*.md`
- Shared styles: `src/styles/global.css`

## Languages

The default Simplified Chinese routes retain their original URLs. Traditional Chinese,
English and Japanese use `/zh-tw/`, `/en/` and `/ja/`. The Header language selector
switches to the same page in another language. All navigation stays in that language.

`npm run i18n:sync` regenerates Traditional Chinese Markdown from the Simplified
Chinese source with OpenCC; it also runs before development and builds. Edit its
source instead of generated `zh-tw/` files. English and Japanese translations are
authored separately and should be updated alongside source changes, keeping the
same filename, ordering, related article IDs and technical meaning. Localized
Markdown images need one extra `../` because of the language subdirectory.

The build rejects missing translations. Metadata, canonical URLs, language
alternates and `/sitemap.xml` are generated for all four languages.

## Deploy

Run `npm run check` and `npm run build` to validate changes locally. Push to `main`
and GitHub Actions will check, build and deploy the site to GitHub Pages. The
deployment workflow is at `.github/workflows/deploy.yml`.

The site is configured for the custom domain `jaysonwu524.com` through `public/CNAME`. In the GitHub repository, configure `Settings` → `Pages` → `Build and deployment` → `Source` as `GitHub Actions`. Then set DNS records for `jaysonwu524.com` according to GitHub Pages' custom-domain instructions and enable HTTPS after DNS verification completes.
