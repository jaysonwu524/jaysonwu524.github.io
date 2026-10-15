import { getCollection } from 'astro:content';
import { contentLocale, contentSlug, localePath, locales, type Locale } from './ui';

export async function localizedCollection<C extends 'articles' | 'projects'>(collection: C, locale: Locale) {
  return getCollection(collection, ({ id }) => contentLocale(id) === locale);
}

// Fail the build if a translation is missing rather than silently serving another language.
export async function siteRoutes() {
  const [articles, projects] = await Promise.all([getCollection('articles'), getCollection('projects')]);
  const sources = (['articles', 'projects'] as const).map((type) => ({ type, entries: type === 'articles' ? articles : projects }));
  return locales.flatMap((locale) => {
    const pages = ['', 'projects', 'articles', 'resume'].map((page) => ({ locale, path: page }));
    for (const { type, entries } of sources) {
      for (const source of entries.filter(({ id }) => contentLocale(id) === 'zh-cn')) {
        const slug = contentSlug(source.id);
        if (!entries.some(({ id }) => contentLocale(id) === locale && contentSlug(id) === slug)) {
          throw new Error(`Missing ${locale} translation: ${type}/${slug}`);
        }
        pages.push({ locale, path: `${type}/${slug}` });
      }
    }
    return pages.map((page) => ({ ...page, url: localePath(locale, page.path) }));
  });
}
