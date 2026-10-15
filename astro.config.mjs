// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://jaysonwu524.com',
	i18n: { locales: ['zh-cn', 'zh-tw', 'en', 'ja'], defaultLocale: 'zh-cn', routing: { prefixDefaultLocale: false } },
	trailingSlash: 'always',
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
