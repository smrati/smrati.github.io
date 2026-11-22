// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
	site: 'https://smrati.github.io',
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
	},
	vite: {
		ssr: {
			noExternal: ['katex'],
		},
	},
	integrations: [
		starlight({
			title: 'Engineering Notes',
			description: 'Exploring software engineering, AI and distributed systems',
			customCss: ['katex/dist/katex.min.css'],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/smrati/smrati.github.io',
				},
			],
			sidebar: [
				{
					label: 'Python Engineering',
					items: [{ autogenerate: { directory: 'python' } }],
				},
				{
					label: 'Machine Learning',
					items: [{ autogenerate: { directory: 'ml' } }],
				},
				{
					label: 'LLMs & Transformers',
					items: [{ autogenerate: { directory: 'llms' } }],
				},
				{
					label: 'RAG & Vector Databases',
					items: [{ autogenerate: { directory: 'rag' } }],
				},
				{
					label: 'Agentic AI & MCP',
					items: [{ autogenerate: { directory: 'agents' } }],
				},
				{
					label: 'Kubernetes',
					items: [{ autogenerate: { directory: 'kubernetes' } }],
				},
				{
					label: 'System Design',
					items: [{ autogenerate: { directory: 'system-design' } }],
				},
				{
					label: 'Mathematics for AI',
					items: [{ autogenerate: { directory: 'math' } }],
				},
			],
		}),
	],
});
