import { Converter } from 'opencc-js';
import { getLocale, unlocalizedPath, type Locale } from './routing';
export { getLocale, unlocalizedPath, localePath, locales, type Locale } from './routing';
export const languageNames: Record<Locale, string> = { 'zh-cn': '简体中文', 'zh-tw': '繁體中文', en: 'English', ja: '日本語' };
export const languageTags: Record<Locale, string> = { 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant', en: 'en', ja: 'ja' };
export const ogLocales: Record<Locale, string> = { 'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW', en: 'en_US', ja: 'ja_JP' };

const zh = {
  siteTitle: 'Jayson Wu｜开发实践与架构思考',
  siteDescription: 'Jayson Wu 的个人网站，分享 AI 应用与复杂业务系统的项目实践、开发记录和架构思考。',
  home: '首页', projects: '项目', articles: '文章', aiPractice: 'AI 实践', resume: '履历',
  skip: '跳到正文', mainNav: '主导航', language: '选择语言',
  darkMode: '深色模式', switchLight: '切换为浅色模式', switchDark: '切换为深色模式',
  previewImage: '预览图片', previewClose: '关闭预览', previewPrevious: '上一张图片', previewNext: '下一张图片',
  previewZoomIn: '放大', previewZoomOut: '缩小', previewReset: '适应窗口', previewLoading: '图片加载中…', previewError: '图片加载失败，请关闭后重试。',
  footerDescription: '记录开发实践，也分享架构思考。', explore: '探索本站', contact: '保持联系', top: '回到顶部', rights: '保留所有权利。',
  statement: '开发者，将灵感转化为代码。', intro: '在此分享开发日常、开源组件库与架构探索之旅。', avatar: 'Jayson Wu 手绘头像',
  about: '关于我', aboutFirst: '专注 AI 应用与复杂业务系统，做过健康服务、实验室管理和交易平台等从 0 到 1 的项目。', aboutSecond: '从业务梳理、产品设计到技术架构与研发交付，关注系统如何解决实际问题，也关注它如何持续演进。',
  domains: '擅长领域', domainTags: ['AI', '健康', '区块链', '教育'],
  selectedArticles: '精选文章', allArticles: '全部文章', cases: '项目案例', allProjects: '全部项目',
  projectsDescription: '从业务梳理到产品交付，记录我参与建设的平台与服务。', projectsMeta: '展示项目的业务背景、产品能力与交付成果。',
  articlesDescription: '从实际项目出发，记录架构取舍、工程实践与团队协作。',
  projectList: '项目列表', articleList: '文章列表', emptyArticles: '文章正在整理中，稍后再来看看。', engineering: '工程实践', audience: '面向：',
  backProjects: '返回项目列表', businessFlow: '核心业务流程', relatedArticles: '相关技术文章', projectNav: '项目导航', nextProject: '下一个项目',
  backArticles: '返回文章列表', contents: '文章目录', chapters: '文章章节', continueReading: '继续阅读',
  sharePage: '分享本页', copyLink: '复制链接', linkCopied: '链接已复制', copyManually: '暂时无法自动复制，请选中下方链接复制。', pageLink: '页面链接',
  notFound: '页面没有找到', notFoundDescription: '这个地址可能已变更，或链接输入有误。可以回到首页，也可以继续浏览文章和项目。', backHome: '返回首页',
  personalResume: '个人履历', role: '软件工程师', location: '杭州 · 中国', strengths: '个人优势', experience: '工作经历', skills: '技术栈', relatedCases: '相关案例',
};
type Messages = typeof zh;
const en: Messages = {
  siteTitle: 'Jayson Wu | Engineering & Architecture', siteDescription: 'Projects, development notes and architectural decisions in AI applications and complex business systems by Jayson Wu.',
  home: 'Home', projects: 'Projects', articles: 'Articles', aiPractice: 'AI Practice', resume: 'Profile', skip: 'Skip to content', mainNav: 'Main navigation', language: 'Choose language',
  darkMode: 'Dark mode', switchLight: 'Switch to light mode', switchDark: 'Switch to dark mode',
  previewImage: 'Image preview', previewClose: 'Close preview', previewPrevious: 'Previous image', previewNext: 'Next image',
  previewZoomIn: 'Zoom in', previewZoomOut: 'Zoom out', previewReset: 'Fit to window', previewLoading: 'Loading image…', previewError: 'Unable to load the image. Close the preview and try again.',
  footerDescription: 'Notes on building software and thinking about architecture.', explore: 'Explore', contact: 'Stay in touch', top: 'Back to top', rights: 'All rights reserved.',
  statement: 'A developer, turning ideas into code.', intro: 'Sharing everyday development, open-source libraries and explorations in architecture.', avatar: 'Hand-drawn portrait of Jayson Wu',
  about: 'About me', aboutFirst: 'I build AI applications and complex business systems, taking health services, laboratory management and trading platforms from concept to delivery.', aboutSecond: 'My work spans business analysis, product design, architecture and engineering delivery. I care about the problems a system solves and how it evolves.',
  domains: 'Areas of experience', domainTags: ['AI', 'Health', 'Blockchain', 'Education'],
  selectedArticles: 'Selected writing', allArticles: 'All articles', cases: 'Project work', allProjects: 'All projects',
  projectsDescription: 'Platforms and services I helped build, from business needs to product delivery.', projectsMeta: 'Business context, product capabilities and delivery outcomes from selected projects.',
  articlesDescription: 'Architectural decisions, engineering practice and team collaboration, drawn from real projects.',
  projectList: 'Project list', articleList: 'Article list', emptyArticles: 'Articles are being prepared. Please check back soon.', engineering: 'Engineering', audience: 'For: ',
  backProjects: 'Back to projects', businessFlow: 'Core business flow', relatedArticles: 'Related technical writing', projectNav: 'Project navigation', nextProject: 'Next project',
  backArticles: 'Back to articles', contents: 'On this page', chapters: 'Article sections', continueReading: 'Read next',
  sharePage: 'Share this page', copyLink: 'Copy link', linkCopied: 'Link copied', copyManually: 'Automatic copying is unavailable. Select and copy the link below.', pageLink: 'Page link',
  notFound: 'Page not found', notFoundDescription: 'This address may have changed, or the link may contain a typo. Return home or keep exploring articles and projects.', backHome: 'Back to home',
  personalResume: 'Professional profile', role: 'Software Engineer', location: 'Hangzhou · China', strengths: 'Professional strengths', experience: 'Experience', skills: 'Technology', relatedCases: 'Related work',
};
const ja: Messages = {
  siteTitle: 'Jayson Wu｜開発の実践とアーキテクチャ', siteDescription: 'AI アプリケーションや複雑な業務システムの開発事例、開発記録、設計上の判断を紹介する Jayson Wu の個人サイトです。',
  home: 'ホーム', projects: 'プロジェクト', articles: '記事', aiPractice: 'AI 活用', resume: '経歴', skip: '本文へ移動', mainNav: 'メインナビゲーション', language: '言語を選択',
  darkMode: 'ダークモード', switchLight: 'ライトモードに切り替え', switchDark: 'ダークモードに切り替え',
  previewImage: '画像プレビュー', previewClose: 'プレビューを閉じる', previewPrevious: '前の画像', previewNext: '次の画像',
  previewZoomIn: '拡大', previewZoomOut: '縮小', previewReset: '画面に合わせる', previewLoading: '画像を読み込み中…', previewError: '画像を読み込めませんでした。閉じてから再度お試しください。',
  footerDescription: '開発の実践と、アーキテクチャについての考察。', explore: 'サイトを探す', contact: 'お問い合わせ', top: 'ページの先頭へ', rights: '無断転載を禁じます。',
  statement: 'アイデアをコードにする開発者。', intro: '日々の開発、オープンソースのライブラリ、アーキテクチャの探求を記録しています。', avatar: 'Jayson Wu の手描きの似顔絵',
  about: '私について', aboutFirst: 'AI アプリケーションと複雑な業務システムを中心に、ヘルスケア、検査室管理、取引プラットフォームなどの立ち上げに携わってきました。', aboutSecond: '業務の整理からプロダクト設計、アーキテクチャ、開発とリリースまで。実際の課題を解決し、継続的に改善できるシステムを目指しています。',
  domains: '経験分野', domainTags: ['AI', 'ヘルスケア', 'ブロックチェーン', '教育'],
  selectedArticles: 'おすすめの記事', allArticles: 'すべての記事', cases: '開発事例', allProjects: 'すべての事例',
  projectsDescription: '業務の整理からリリースまで、構築に携わったプラットフォームとサービスを紹介します。', projectsMeta: 'プロジェクトの業務背景、製品の機能、開発成果を紹介します。',
  articlesDescription: '実際の開発経験をもとに、設計の判断、開発の実践、チームの協働を記録しています。',
  projectList: 'プロジェクト一覧', articleList: '記事一覧', emptyArticles: '記事を準備中です。またお立ち寄りください。', engineering: '開発の実践', audience: '対象：',
  backProjects: 'プロジェクト一覧へ', businessFlow: '主な業務フロー', relatedArticles: '関連する技術記事', projectNav: 'プロジェクトナビゲーション', nextProject: '次のプロジェクト',
  backArticles: '記事一覧へ', contents: '目次', chapters: '記事の各章', continueReading: '次に読む',
  sharePage: 'このページを共有', copyLink: 'リンクをコピー', linkCopied: 'リンクをコピーしました', copyManually: '自動コピーを利用できません。下のリンクを選択してコピーしてください。', pageLink: 'ページのリンク',
  notFound: 'ページが見つかりません', notFoundDescription: 'アドレスが変更されたか、リンクに誤りがある可能性があります。ホームに戻るか、記事やプロジェクトをご覧ください。', backHome: 'ホームに戻る',
  personalResume: 'プロフィール', role: 'ソフトウェアエンジニア', location: '杭州 · 中国', strengths: '強み', experience: '職務経歴', skills: '技術スタック', relatedCases: '関連事例',
};
const toTraditional = Converter({ from: 'cn', to: 'tw' });
export const messages: Record<Locale, Messages> = { 'zh-cn': zh, 'zh-tw': JSON.parse(toTraditional(JSON.stringify(zh))), en, ja };

export function contentLocale(id: string): Locale { return getLocale(`/${id}`); }
export function contentSlug(id: string): string { return unlocalizedPath(`/${id}`); }
