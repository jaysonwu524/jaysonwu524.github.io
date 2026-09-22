# Jayson Wu personal site

Astro personal portfolio for `jaysonwu524.com`.

## Local development

```sh
npm install
npm run dev
```

## Content locations

- Homepage: `src/pages/index.astro`
- Projects: `src/pages/projects.astro`
- Resume: `src/pages/resume.astro`
- Articles: `src/content/articles/*.md`
- Shared styles: `src/styles/global.css`

## Deploy

Push to `main` and GitHub Actions will build and deploy the site to GitHub Pages. The deployment workflow is at `.github/workflows/deploy.yml`.

The site is configured for the custom domain `jaysonwu524.com` through `public/CNAME`. In the GitHub repository, configure `Settings` → `Pages` → `Build and deployment` → `Source` as `GitHub Actions`. Then set DNS records for `jaysonwu524.com` according to GitHub Pages' custom-domain instructions and enable HTTPS after DNS verification completes.
