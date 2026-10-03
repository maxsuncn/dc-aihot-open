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
  footerNote: "原文版权归各来源所有；摘要用于发现线索，重要事实请回到原文核验。",
  icp: null as string | null,
  organization: {
    name: "MaxTiger情报站",
    founder: null as null | { name: string; url?: string; description?: string },
  },
  crawlerName: "AIInfraBot",
} as const;

export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  headline: ["数据中心的变化，", "从信号追到项目。"] as [string, string],
  lead: "面向数据中心建设与运维产业链，持续追踪智算机房、电力与储能、冷却热管理。",
  steps: {
    collect: "持续采集公开信息，追踪智算机房、电力与储能、冷却热管理及产业链动态。",
    store: "解析内容、归并重复报道，保留来源、时间和原文链接。",
    select: "结合评分与来源材料，区分已确认事实、厂商主张和仍待核验的线索。",
    publish: "每日更新5-8篇，每周周刊汇总本周情报主线，并链接到最具阅读价值的文章。",
  },
  process: "公开信息进，结构化情报出——解析、去重、交叉验证，每条信号都标注证据等级。",
  openSource: "作为开源免费项目，服务与我自己，也希望服务到你：关注算力基础设施正在发生什么。",
  weeklyLead: "也可以",
  weeklyLinkLabel: "留下邮箱订阅周刊",
  weeklyUrl: "https://quaily.com/maxtiger/",
  weeklyTail: "，每周 10 分钟在邮箱中阅读全球数据中心建设与运维的动态。",
  copyright: `${SITE.name} 是聚合摘要和阅读索引，原文版权归各来源所有。更正、下架或调整展示方式请通过`,
  contact: "如果你在产业链里——技术、建设、投资，也欢迎加我的微信聊聊。合作、勘误、提供线索、八卦行业，都欢迎。",
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
