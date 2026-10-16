import { getLocale, localePath, unlocalizedPath, type Locale } from '../i18n/routing';

// GitHub Pages serves the root 404.html for every missing URL, including localized ones.
// Adapt that same document in place, preserving both the requested address and HTTP 404.
const locale = getLocale(location.pathname);
const translations: Record<Locale, { name: string; lang: string; labels: Record<string, string> }> = JSON.parse(document.querySelector('[data-error-translations]')!.textContent!);
const t = translations[locale].labels;
document.documentElement.lang = translations[locale].lang;
document.title = `404 · ${t.notFound} | Jayson Wu`;
document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', t.notFoundDescription);

document.querySelectorAll<HTMLElement>('[data-ui-text]').forEach((element) => {
  const value = t[element.dataset.uiText as keyof typeof t];
  if (typeof value === 'string') element.textContent = value;
});
document.querySelectorAll<HTMLAnchorElement>('[data-error-path]').forEach((link) => {
  link.href = localePath(locale, link.dataset.errorPath);
});
document.querySelector('.error-links')?.setAttribute('aria-label', t.explore);

document.querySelectorAll<HTMLAnchorElement>('.site-nav a, .footer-nav-links a').forEach((link) => {
  const path = unlocalizedPath(new URL(link.href).pathname);
  const key = path === '' ? 'home' : path as 'articles' | 'projects' | 'resume';
  link.href = localePath(locale, path);
  link.textContent = t[key];
  link.removeAttribute('aria-current');
});
document.querySelector('.site-nav')?.setAttribute('aria-label', t.mainNav);
const brand = document.querySelector<HTMLAnchorElement>('.brand');
if (brand) {
  brand.href = localePath(locale);
  brand.setAttribute('aria-label', `jaysonwu524.com · ${t.home}`);
}
const language = document.querySelector('.language-picker');
language?.querySelector('summary')?.setAttribute('aria-label', t.language);
language?.querySelector('nav')?.setAttribute('aria-label', t.language);
const currentLanguage = language?.querySelector('.language-current');
if (currentLanguage) currentLanguage.textContent = translations[locale].name;
language?.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
  const target = getLocale(new URL(link.href).pathname);
  link.href = target === 'zh-cn' ? '/404.html' : localePath(target, '404');
  if (target === locale) link.setAttribute('aria-current', 'true');
  else link.removeAttribute('aria-current');
  // The server-rendered checkmark may belong to the root document's language.
  link.querySelector('.ui-icon')?.remove();
});
const theme = document.querySelector<HTMLElement>('[data-theme-toggle]');
if (theme) {
  theme.dataset.lightLabel = t.switchLight;
  theme.dataset.darkLabel = t.switchDark;
  theme.setAttribute('aria-label', t.darkMode);
  theme.title = document.documentElement.dataset.theme === 'dark' ? t.switchLight : t.switchDark;
}
