import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		editorialScore: z.number().min(0).max(10),
		readingTime: z.string(),
		tags: z.array(z.string()),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		name: z.string(),
		title: z.string(),
		description: z.string(),
		category: z.string(),
		order: z.number(),
		tags: z.array(z.string()),
		audience: z.string(),
		flow: z.array(z.string()),
		relatedArticles: z.array(z.string()).default([]),
	}),
});

export const collections = { articles, projects };
