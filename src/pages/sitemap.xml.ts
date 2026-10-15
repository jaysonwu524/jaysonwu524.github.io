import type { APIRoute } from 'astro';
import { siteRoutes } from '../i18n/content';
import { languageTags, localePath, locales } from '../i18n/ui';

export const GET: APIRoute = async ({ site }) => {
  const routes = await siteRoutes();
  const absolute = (path: string) => new URL(path, site).href;
  const body = routes.map(({ path, url }) => `<url><loc>${absolute(url)}</loc>${locales.map((locale) => `<xhtml:link rel="alternate" hreflang="${languageTags[locale]}" href="${absolute(localePath(locale, path))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(localePath('zh-cn', path))}"/></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
