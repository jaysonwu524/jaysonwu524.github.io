import { Converter } from 'opencc-js';

export const locales = ['zh-cn', 'zh-tw', 'en', 'ja'] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<Locale, string> = { 'zh-cn': '简体中文', 'zh-tw': '繁體中文', en: 'English', ja: '日本語' };
export const languageTags: Record<Locale, string> = { 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant', en: 'en', ja: 'ja' };
export const ogLocales: Record<Locale, string> = { 'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW', en: 'en_US', ja: 'ja_JP' };

const zh = {
  siteTitle: 'Jayson Wu｜开发实践与架构思考',
  siteDescription: 'Jayson Wu 的个人网站，分享 AI 应用与复杂业务系统的项目实践、开发记录和架构思考。',
  home: '首页', projects: '项目', articles: '文章', resume: '履历',
  skip: '跳到正文', mainNav: '主导航', language: '选择语言',
  footerDescription: '记录开发实践，也分享架构思考。', explore: '探索本站', contact: '保持联系', top: '回到顶部', rights: '保留所有权利。',
  statement: '开发者，将灵感转化为代码。', intro: '在此分享开发日常、开源组件库与架构探索之旅。', avatar: 'Jayson Wu 手绘头像',
  about: '关于我', aboutFirst: '专注 AI 应用与复杂业务系统，做过健康服务、实验室管理和交易平台等从 0 到 1 的项目。', aboutSecond: '从业务梳理、产品设计到技术架构与研发交付，关注系统如何解决实际问题，也关注它如何持续演进。',
  domains: '擅长领域', domainTags: ['AI', '健康', '区块链', '教育'],
  selectedArticles: '精选文章', allArticles: '全部文章', cases: '项目案例', allProjects: '全部项目',
  projectsDescription: '从业务梳理到产品交付，记录我参与建设的平台与服务。', projectsMeta: '展示项目的业务背景、产品能力与交付成果。',
  articlesDescription: '从实际项目出发，记录架构取舍、并发处理与工程实践。',
  projectList: '项目列表', articleList: '文章列表', emptyArticles: '文章正在整理中，稍后再来看看。', engineering: '工程实践', audience: '面向：',
  backProjects: '返回项目列表', businessFlow: '核心业务流程', relatedArticles: '相关技术文章', projectNav: '项目导航', nextProject: '下一个项目',
  backArticles: '返回文章列表', contents: '文章目录', chapters: '文章章节', continueReading: '继续阅读',
  personalResume: '个人履历', role: '软件工程师', location: '杭州 · 中国', strengths: '个人优势', experience: '工作经历', skills: '技术栈', relatedCases: '相关案例',
};
type Messages = typeof zh;
const en: Messages = {
  siteTitle: 'Jayson Wu | Engineering & Architecture', siteDescription: 'Projects, development notes and architectural decisions in AI applications and complex business systems by Jayson Wu.',
  home: 'Home', projects: 'Projects', articles: 'Articles', resume: 'Profile', skip: 'Skip to content', mainNav: 'Main navigation', language: 'Choose language',
  footerDescription: 'Notes on building software and thinking about architecture.', explore: 'Explore', contact: 'Stay in touch', top: 'Back to top', rights: 'All rights reserved.',
  statement: 'A developer, turning ideas into code.', intro: 'Sharing everyday development, open-source libraries and explorations in architecture.', avatar: 'Hand-drawn portrait of Jayson Wu',
  about: 'About me', aboutFirst: 'I build AI applications and complex business systems, taking health services, laboratory management and trading platforms from concept to delivery.', aboutSecond: 'My work spans business analysis, product design, architecture and engineering delivery. I care about the problems a system solves and how it evolves.',
  domains: 'Areas of experience', domainTags: ['AI', 'Health', 'Blockchain', 'Education'],
  selectedArticles: 'Selected writing', allArticles: 'All articles', cases: 'Project work', allProjects: 'All projects',
  projectsDescription: 'Platforms and services I helped build, from business needs to product delivery.', projectsMeta: 'Business context, product capabilities and delivery outcomes from selected projects.',
  articlesDescription: 'Architectural decisions, concurrency and engineering practice, drawn from real projects.',
  projectList: 'Project list', articleList: 'Article list', emptyArticles: 'Articles are being prepared. Please check back soon.', engineering: 'Engineering', audience: 'For: ',
  backProjects: 'Back to projects', businessFlow: 'Core business flow', relatedArticles: 'Related technical writing', projectNav: 'Project navigation', nextProject: 'Next project',
  backArticles: 'Back to articles', contents: 'On this page', chapters: 'Article sections', continueReading: 'Read next',
  personalResume: 'Professional profile', role: 'Software Engineer', location: 'Hangzhou · China', strengths: 'Professional strengths', experience: 'Experience', skills: 'Technology', relatedCases: 'Related work',
};
const ja: Messages = {
  siteTitle: 'Jayson Wu｜開発の実践とアーキテクチャ', siteDescription: 'AI アプリケーションや複雑な業務システムの開発事例、開発記録、設計上の判断を紹介する Jayson Wu の個人サイトです。',
  home: 'ホーム', projects: 'プロジェクト', articles: '記事', resume: '経歴', skip: '本文へ移動', mainNav: 'メインナビゲーション', language: '言語を選択',
  footerDescription: '開発の実践と、アーキテクチャについての考察。', explore: 'サイトを探す', contact: 'お問い合わせ', top: 'ページの先頭へ', rights: '無断転載を禁じます。',
  statement: 'アイデアをコードにする開発者。', intro: '日々の開発、オープンソースのライブラリ、アーキテクチャの探求を記録しています。', avatar: 'Jayson Wu の手描きの似顔絵',
  about: '私について', aboutFirst: 'AI アプリケーションと複雑な業務システムを中心に、ヘルスケア、検査室管理、取引プラットフォームなどの立ち上げに携わってきました。', aboutSecond: '業務の整理からプロダクト設計、アーキテクチャ、開発とリリースまで。実際の課題を解決し、継続的に改善できるシステムを目指しています。',
  domains: '経験分野', domainTags: ['AI', 'ヘルスケア', 'ブロックチェーン', '教育'],
  selectedArticles: 'おすすめの記事', allArticles: 'すべての記事', cases: '開発事例', allProjects: 'すべての事例',
  projectsDescription: '業務の整理からリリースまで、構築に携わったプラットフォームとサービスを紹介します。', projectsMeta: 'プロジェクトの業務背景、製品の機能、開発成果を紹介します。',
  articlesDescription: '実際の開発経験をもとに、設計の判断、並行処理、エンジニアリングの実践を記録しています。',
  projectList: 'プロジェクト一覧', articleList: '記事一覧', emptyArticles: '記事を準備中です。またお立ち寄りください。', engineering: '開発の実践', audience: '対象：',
  backProjects: 'プロジェクト一覧へ', businessFlow: '主な業務フロー', relatedArticles: '関連する技術記事', projectNav: 'プロジェクトナビゲーション', nextProject: '次のプロジェクト',
  backArticles: '記事一覧へ', contents: '目次', chapters: '記事の各章', continueReading: '次に読む',
  personalResume: 'プロフィール', role: 'ソフトウェアエンジニア', location: '杭州 · 中国', strengths: '強み', experience: '職務経歴', skills: '技術スタック', relatedCases: '関連事例',
};
const toTraditional = Converter({ from: 'cn', to: 'tw' });
export const messages: Record<Locale, Messages> = { 'zh-cn': zh, 'zh-tw': JSON.parse(toTraditional(JSON.stringify(zh))), en, ja };

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

export function contentLocale(id: string): Locale { return getLocale(`/${id}`); }
export function contentSlug(id: string): string { return unlocalizedPath(`/${id}`); }
