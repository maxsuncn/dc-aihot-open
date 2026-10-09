// Data-center construction and operations intelligence identity.

export const SITE = {
  name: "MaxTiger情报站",
  subject: "数据中心",
  homeTitle: "MaxTiger情报站 — 聚焦数据中心建设与运维",
  description: "面向数据中心建设与运维产业链，持续追踪智算机房、电力与储能、冷却热管理。",
  tagline: "聚焦数据中心建设与运维",
  brandNote: "聚焦数据中心建设与运维",
  locale: "zh-CN",
  defaultUrl: "http://localhost:3000",
  mcpPrefix: "dcsignal",
  contactEmail: null as string | null,
  icp: null as string | null,
  organization: {
    name: "MaxTiger情报站",
    founder: null as null | { name: string; url?: string; description?: string },
  },
  crawlerName: "AIInfraBot",
} as const;

export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  headline: ["数据中心的变化，", "从信息到洞察"] as [string, string],
  lead: "追踪算力基础设施与数据中心建设运维动态，把信息整理成值得关注的行业洞察。",
  greeting: "你好，我是 MaxTiger。AI 时代，我想做一个更高效的行业情报站。开源、免费，我自己在用，也希望能帮到你：一起关注算力基础设施，以及数据中心建设与运维行业正在发生的，值得关注的事。",
  sourcesIntro: "这里关注主流媒体、企业官网、公众号、X（原 Twitter）和 Google Alerts 等渠道中的相关话题，并对信息进行结构化整理、去重与交叉核验，尽力帮你更快掌握值得关注的行业动态。",
  useLead: "如果你觉得有用，可以：",
  bookmarkTip: "把网站加入浏览器书签，或收藏到微信浮窗，方便随时回来。",
  newsletterBefore: "邮箱订阅周刊",
  newsletterAfter: "，每周花 10 分钟，在邮箱里读完行业动态。",
  agentBefore: "让 AI Agent 接入本站",
  agentAfter: "，在接入页查看 MCP、网页/API 等方式，再用自然语言查询行业信息；也可以把这些配置写进你常用的 Skill。",
  steps: {
    collect: "持续采集公开信息，追踪智算机房、电力与储能、冷却热管理及产业链动态。",
    store: "解析内容、归并重复报道，保留来源、时间和原文链接。",
    publish: "每日更新5-8篇，每周周刊汇总本周情报主线，并链接到最具阅读价值的文章。",
    community: "欢迎联络，互通有无",
  },
  weeklyUrl: "https://quaily.com/maxtiger/",
  copyright: "原文版权归各来源所有。如需补充、更正，或换展示形式（微信公众号可只显示摘要，阅读原文跳转到微信原文，让这里成为你公众号的流量入口）。任何需求和建议都可以通过",
  maker: null as null | {
    name: string;
    greeting: string[];
    avatarSourceId?: string | null;
    wechat?: { title: string; note: string };
    feishu?: { title: string; note: string };
  },
} as const;

export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}

/** “按主题看 AI”“往期 AI 日报”这类说法：行业词接在中文后面，英文词前加空格，中文词不加；noun 照 withSubject 接上。 */
export function subjectAfter(text: string, noun?: string): string {
  const gap = /^[A-Za-z0-9]/.test(SITE.subject) ? " " : "";
  return `${text}${gap}${noun ? withSubject(noun) : SITE.subject}`;
}
