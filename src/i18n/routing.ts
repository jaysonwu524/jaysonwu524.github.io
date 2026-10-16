// Keep URL helpers independent of server-side translation/conversion libraries.
export const locales = ['zh-cn', 'zh-tw', 'en', 'ja'] as const;
export type Locale = typeof locales[number];

export function getLocale(path: string): Locale {
  const prefix = path.split('/')[1];
  return locales.find((locale) => locale !== 'zh-cn' && prefix === locale) ?? 'zh-cn';
}

export function unlocalizedPath(path: string): string {
  const locale = getLocale(path);
  return (locale === 'zh-cn' ? path : path.slice(locale.length + 1)).replace(/^\/+|\/+$/g, '');
}

export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `/${[locale === 'zh-cn' ? '' : locale, clean].filter(Boolean).join('/')}${clean || locale !== 'zh-cn' ? '/' : ''}`;
}
