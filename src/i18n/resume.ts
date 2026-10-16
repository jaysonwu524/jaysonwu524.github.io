import { Converter } from 'opencc-js';
import type { Locale } from './ui';

const sharedSkills = [
  'Java (JDK 17, 21) / Spring Boot / Spring Cloud Alibaba / Spring Cloud Gateway / Netty / Dubbo / gRPC / MyBatis-Plus',
  'LangChain / LangGraph / AgentScope / RAG / Milvus / MinerU / OCR / ASR',
  'MySQL / PostgreSQL / MongoDB / MinIO / S3 / Dynamic-Datasource / Flyway',
  'Redis / Redisson / Kafka / RocketMQ / RabbitMQ / XXL-JOB',
  'Nacos / Sentinel / Resilience4j / Spring Security / Sa-Token',
  'SkyWalking / Prometheus / Spring Boot Admin / Actuator / Docker / CI/CD',
  'Vue 3 / React / TypeScript / Umi Max / Ant Design / qiankun / Taro / Vite',
];
const related = [
  [{ name: 'RegenBio Cloud', href: '/projects/regenbio/' }, { name: 'LAIFE AI', href: '/projects/laife-ai/' }],
  [{ name: 'LHMS Framework', href: '/projects/lhms-framework/' }, { name: 'RateHub', href: '/articles/architecture-evolution/' }],
  [],
];
const zh = {
  strengths: [
    '拥有 5 年 IT 与软件研发经验，近年来主导多个从 0 到 1 的平台型项目建设，覆盖 AI 商业化应用、SaaS、健康检测与实验室业务、CRM 及交易平台。',
    '具备 AI 产品工程化落地能力，将 Agent 编排、向量检索与文档解析应用于健康资料整理和辅助服务，实践过会话记忆、状态持久化、租户隔离及跨实例恢复。',
    '兼具业务规划、产品设计与技术架构能力，能够主导需求挖掘、场景拆解、方案设计、技术攻坚、研发管理、上线交付与持续迭代。',
    '熟悉多租户、权限隔离、支付交易闭环、异步任务与消息驱动处理，能够建立 CI/CD 与稳定性保障机制，协调多团队完成高质量交付。',
  ],
  experience: [
    { period: '2024.08 至今', role: '研发高级主管', company: 'Regenerative Bio', detail: '从 0 到 1 搭建 IT 与数字化研发体系，主导需求评审、开发规范、分支发布、测试验收、上线回滚与 CI/CD 流程。建设统一认证授权、多租户、配置中心、文件存储、通知、日志监控和网关治理等平台底座，支撑 5 条业务线复用。', projects: [{ name: 'RegenBio Cloud 健康业务平台', href: '/projects/regenbio/' }, { name: 'LAIFE AI', href: '/projects/laife-ai/' }] },
    { period: '2022.04 至 2024.08', role: '研发组长', company: '重庆云链天诚数据科技有限公司', detail: '负责政企数字化与区块链交易平台业务线的架构设计、研发管理和项目交付。主导行情聚合系统、交易所通用中台和多个 ToB / ToG 项目落地，建立 Code Review、技术培训、交付规范和项目复盘机制。', projects: [{ name: 'LHMS 通用业务中台', href: '/projects/lhms-framework/' }, { name: 'RateHub 架构实践', href: '/articles/architecture-evolution/' }] },
    { period: '2021.05 至 2022.03', role: 'IT 技术支持', company: '科大讯飞股份有限公司', detail: '负责智慧校园业务系统现场技术支持与运维保障，日均处理 10+ 技术工单，覆盖教学、考试、排课、账号权限、数据同步和高峰期保障。', projects: [] },
  ],
  skills: [
    { title: '后端与服务架构', body: 'Java（JDK 17、21） / Spring Boot / Spring Cloud Alibaba / Spring Cloud Gateway / Netty / Dubbo / gRPC / MyBatis-Plus' },
    { title: 'AI 应用工程', body: `${sharedSkills[1]} / Agent 会话记忆与状态持久化` },
    { title: '数据库与对象存储', body: sharedSkills[2] },
    { title: '消息、缓存与任务', body: `${sharedSkills[3]} / JDK 21 虚拟线程` },
    { title: '服务治理与安全', body: `${sharedSkills[4]} / 多租户与权限隔离` },
    { title: '可观测与交付', body: sharedSkills[5] },
    { title: '前端与多端', body: sharedSkills[6] },
  ],
};
type Resume = typeof zh;
const en: Resume = {
  strengths: [
    'Five years of experience in IT and software engineering, with recent work leading platform projects from inception to delivery across commercial AI applications, SaaS, health testing and laboratory operations, CRM and trading.',
    'Experience bringing AI products into production, applying agent orchestration, vector retrieval and document parsing to health information and assisted services, including conversation memory, persistent state, tenant isolation and recovery across instances.',
    'Combines business planning, product design and system architecture, leading requirements discovery, workflow analysis, solution design, technical problem solving, engineering management, releases and ongoing iteration.',
    'Experienced in multi-tenancy, access isolation, payment workflows, asynchronous tasks and message-driven processing; builds CI/CD and reliability practices and coordinates teams through delivery.',
  ],
  experience: [
    { period: 'Aug 2024 – Present', role: 'Senior Engineering Supervisor', company: 'Regenerative Bio', detail: 'Established IT and digital engineering practices from the ground up, covering requirements reviews, coding standards, branching and releases, acceptance testing, rollback and CI/CD. Built shared authentication and authorization, multi-tenancy, configuration, file storage, notifications, logging, monitoring and gateway capabilities reused across five business lines.', projects: related[0] },
    { period: 'Apr 2022 – Aug 2024', role: 'Engineering Team Lead', company: 'Chongqing Yunlian Tiancheng Data Technology', detail: 'Led architecture, engineering management and delivery for enterprise and government digitalization and blockchain trading platforms. Delivered market-data aggregation, a shared exchange administration platform and multiple B2B/B2G projects, introducing code reviews, technical training, delivery standards and retrospectives.', projects: related[1] },
    { period: 'May 2021 – Mar 2022', role: 'IT Technical Support', company: 'iFLYTEK', detail: 'Provided on-site technical support and operations for smart-campus systems, handling over 10 tickets a day across teaching, exams, scheduling, accounts and permissions, data synchronization and peak-period support.', projects: [] },
  ],
  skills: ['Backend & service architecture', 'AI application engineering', 'Databases & object storage', 'Messaging, caching & jobs', 'Service governance & security', 'Observability & delivery', 'Frontend & cross-platform'].map((title, i) => ({ title, body: sharedSkills[i] + (i === 1 ? ' / Agent memory & persistent state' : i === 3 ? ' / JDK 21 virtual threads' : i === 4 ? ' / Multi-tenancy & access isolation' : '') })),
};
const ja: Resume = {
  strengths: [
    'IT・ソフトウェア開発で 5 年の経験があり、近年は AI の事業化、SaaS、健康検査・検査室業務、CRM、取引プラットフォームなど、複数のプラットフォームの立ち上げを主導してきました。',
    'Agent のオーケストレーション、ベクトル検索、文書解析を健康情報の整理やサービス支援に応用。会話メモリ、状態の永続化、テナント分離、インスタンスをまたぐ復旧など、AI 製品の実運用に取り組んでいます。',
    '業務企画、プロダクト設計、システム設計を横断し、要件の発見、業務の分解、方式設計、技術課題の解決、開発管理、リリース、継続的な改善まで主導できます。',
    'マルチテナント、権限分離、決済フロー、非同期タスク、メッセージ駆動処理の経験があります。CI/CD と安定運用の仕組みを整え、複数チームを調整して開発を進めます。',
  ],
  experience: [
    { period: '2024.08 – 現在', role: '開発シニアスーパーバイザー', company: 'Regenerative Bio', detail: 'IT・デジタル開発体制を立ち上げ、要件レビュー、開発規約、ブランチ・リリース管理、受け入れテスト、ロールバック、CI/CD を整備。認証認可、マルチテナント、設定管理、ファイル保存、通知、ログ・監視、ゲートウェイ制御を共通基盤として構築し、5 つの事業領域での再利用を支えています。', projects: related[0] },
    { period: '2022.04 – 2024.08', role: '開発チームリーダー', company: '重庆云链天诚数据科技有限公司', detail: '企業・行政向けデジタル化とブロックチェーン取引プラットフォームの設計、開発管理、納品を担当。相場情報集約、取引所向け共通管理基盤、複数の B2B・B2G プロジェクトを主導し、コードレビュー、技術研修、納品規約、振り返りを導入しました。', projects: related[1] },
    { period: '2021.05 – 2022.03', role: 'IT テクニカルサポート', company: 'iFLYTEK（科大讯飞）', detail: 'スマートキャンパス業務システムの現地サポートと運用を担当。授業、試験、時間割、アカウント・権限、データ同期、繁忙期対応など、1 日平均 10 件以上の技術問い合わせを処理しました。', projects: [] },
  ],
  skills: ['バックエンド・サービス設計', 'AI アプリケーション開発', 'データベース・オブジェクトストレージ', 'メッセージ・キャッシュ・ジョブ', 'サービス制御・セキュリティ', '可観測性・デリバリー', 'フロントエンド・マルチプラットフォーム'].map((title, i) => ({ title, body: sharedSkills[i] + (i === 1 ? ' / Agent メモリ・状態の永続化' : i === 3 ? ' / JDK 21 仮想スレッド' : i === 4 ? ' / マルチテナント・権限分離' : '') })),
};
const convert = Converter({ from: 'cn', to: 'tw' });
export const resumes: Record<Locale, Resume> = { 'zh-cn': zh, 'zh-tw': JSON.parse(convert(JSON.stringify(zh))), en, ja };
