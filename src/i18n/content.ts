import { getCollection } from 'astro:content';
import { contentLocale, contentSlug, localePath, locales, type Locale } from './ui';

export async function localizedCollection<C extends 'articles' | 'projects'>(collection: C, locale: Locale) {
  return getCollection(collection, ({ id }) => contentLocale(id) === locale);
}

// Fail the build if a translation is missing rather than silently serving another language.
export async function siteRoutes() {
  const [articles, projects, practice] = await Promise.all([getCollection('articles'), getCollection('projects'), getCollection('practice')]);
  for (const project of projects) {
    const locale = contentLocale(project.id);
    for (const slug of project.data.relatedArticles) {
      if (!articles.some((article) => contentLocale(article.id) === locale && contentSlug(article.id) === slug.trim())) {
        throw new Error(`Invalid related article in ${project.id}: ${slug}`);
      }
    }
  }
  for (const page of practice) {
    const locale = contentLocale(page.id);
    if (!projects.some(({ id }) => contentLocale(id) === locale && contentSlug(id) === page.data.relatedProject)
      || !articles.some(({ id }) => contentLocale(id) === locale && contentSlug(id) === page.data.relatedArticle)) {
      throw new Error(`Invalid practice recommendation in ${page.id}`);
    }
  }
  const sources = [
    { type: 'articles', entries: articles },
    { type: 'projects', entries: projects },
    { type: 'practice', entries: practice },
  ];
  return locales.flatMap((locale) => {
    const pages = ['', 'projects', 'articles', 'resume'].map((page) => ({ locale, path: page }));
    for (const { type, entries } of sources) {
      for (const source of entries.filter(({ id }) => contentLocale(id) === 'zh-cn')) {
        const slug = contentSlug(source.id);
        if (!entries.some(({ id }) => contentLocale(id) === locale && contentSlug(id) === slug)) {
          throw new Error(`Missing ${locale} translation: ${type}/${slug}`);
        }
        pages.push({ locale, path: type === 'practice' ? 'ai' : `${type}/${slug}` });
      }
    }
    return pages.map((page) => ({ ...page, url: localePath(locale, page.path) }));
  });
}
