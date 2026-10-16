// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://jaysonwu524.com',
	i18n: { locales: ['zh-cn', 'zh-tw', 'en', 'ja'], defaultLocale: 'zh-cn', routing: { prefixDefaultLocale: false } },
	trailingSlash: 'always',
	// GitHub Pages serves these as static HTML redirects; old shared URLs stay usable.
	redirects: Object.fromEntries(['', '/zh-tw', '/en', '/ja'].flatMap((prefix) => [
		[`${prefix}/articles/ai-working-practice/`, `${prefix}/ai/`],
		[`${prefix}/articles/report-system-consistency/`, `${prefix}/projects/regenbio/`],
	])),
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
