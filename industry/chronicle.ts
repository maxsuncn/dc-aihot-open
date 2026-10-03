// 主题页“大事记”的行业规则。通用的几步在框架里（packages/backend/src/publication/topic-chronicle.ts）：
// 从近 12 个月已公开的精选里，按这里的规则定类型，比精选分门槛，把同一件事并成一个节点，按每月名额取舍，
// 再写成事件名；公司主题只收这家公司自己的（看事实主体，没有主体时看标题在发布动作之前先点名谁）。
// 换行业时改这个文件：节点类型（名称、门槛、名额、画在哪一行）、内容形态主题收哪些类型、发布动作、
// 一篇报道算哪类节点。合并同一发布、写事件名两项可选，删掉就用框架的做法：只合并标题或事件名相同的，
// 事件名取标题的第一句。
// 公司编年史还可以接上人工整理的历史：industry/chronicles/{主题 slug}.json，格式见 docs/customize.md。

/** 主题的分组（topics.json 的 group）：公司、方向、内容形态。 */
type Group = "company" | "field" | "genre";

/** 一类节点。 */
export interface ChronicleKind {
  /** 卡片和时间轴上的类型名。 */
  label: string;
  /** 公司编年史里排在时间轴上方一行（AI：模型），标记最醒目；其余类型在下方一行。 */
  above?: true;
  /** 主题自己推出的东西（AI：模型、产品），用强调色标记；公司主题只收这家公司自己发布的。其余类型算新闻，公司主题只收以这家公司为主体的。 */
  launch?: true;
  /** 公司主题收这类节点的精选分门槛和每月名额（各类型分开取，互不挤占）；不写就不收。 */
  company?: { min: number; perMonth: number };
  /** 方向和形态主题收这类节点的精选分门槛（这些主题每月按重要程度取前 5 件）；不写就不收。 */
  other?: { min: number };
}

/** 规则读到的一篇入选报道。 */
export interface ChronicleItem {
  title: string;
  /** 外文报道的原标题。 */
  originalTitle: string | null;
  category: string | null;
  tags: string[];
  /** 属于这个行业最受关注的那类发布（taxonomy.ts 的 RELEASE）。 */
  release: boolean;
  /** 结构化抽取出的事实动作，比如 launch、opinion。 */
  factAction: string | null;
}

/** 一个候选节点：代表报道、事件名和它的全部报道。 */
export interface ChronicleEvent {
  kind: string;
  label: string;
  head: { title: string };
  reports: ReadonlyArray<{ title: string }>;
}

export interface ChronicleRules {
  /** 节点类型。公司主题的搜索摘要按这里的先后列出。 */
  kinds: Record<string, ChronicleKind>;
  /** 内容形态主题的大事记收哪些类型，每月最多几件（默认 5）；没列出的形态主题不设大事记，直接读精选。 */
  forms: Record<string, { kinds: string[]; perMonth?: number }>;
  /** 发布动作。公司主题遇到没有事实主体的报道，看标题在它之前先点名的是哪家公司。 */
  launchVerb: RegExp;
  /** 一篇报道在这一组主题里算哪类节点；不论分数高低都不算节点时返回 null（预告、教程、平台上架……）。 */
  kindOf(item: ChronicleItem, group: Group): string | null;
  /** 可选：同一周、同一类型的两个节点是不是同一件事（归组漏掉的同一发布）。 */
  sameEvent?(a: ChronicleEvent, b: ChronicleEvent): boolean;
  /** 可选：节点在时间轴上的名字（“Claude Opus 5.5 发布”），由代表报道的标题得出。 */
  eventName?(title: string, kind: string, topic: { slug: string; orgNames: readonly string[] }): string;
}

export const CHRONICLE: ChronicleRules = {
  kinds: {
    project: { label: "项目", above: true, company: { min: 80, perMonth: 3 }, other: { min: 80 } },
    technology: { label: "技术", company: { min: 80, perMonth: 2 }, other: { min: 80 } },
    company: { label: "玩家", company: { min: 80, perMonth: 2 }, other: { min: 80 } },
    research: { label: "白皮书", other: { min: 80 } },
    market: { label: "市场", other: { min: 80 } },
  },
  forms: {
    "research-reports": { kinds: ["research"] },
    market: { kinds: ["market", "company"] },
    "policy-and-standards": { kinds: ["market", "technology", "project"] },
  },
  launchVerb: /发布|推出|开工|投产|交付|扩建|签约|并购|launch|commission|open/i,
  kindOf(item) {
    if (/^(opinion|commentary|prediction|tutorial)$/i.test(item.factAction ?? "")) return null;
    return ({ projects: "project", technology: "technology", players: "company", whitepaper: "research", market: "market" } as Record<string, string>)[item.category ?? ""] ?? null;
  },
};
