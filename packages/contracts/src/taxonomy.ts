// Public vocabularies shared by the website, the API and the worker. The categories themselves belong to
// the industry pack (industry/taxonomy.ts); their keys are external identities (URLs, API, RSS).
import { CATEGORIES } from "@aihot/industry/taxonomy";

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as unknown as readonly [CategoryKey, ...CategoryKey[]];

/** Old public category slugs remain accepted as filters; responses use the current category vocabulary. */
export const LEGACY_CATEGORY_ALIASES = {
  "power-cooling": "technology",
  operations: "technology",
  practice: "technology",
  industry: "market",
  research: "whitepaper",
  policy: "market",
} as const satisfies Record<string, CategoryKey>;
export type LegacyCategoryKey = keyof typeof LEGACY_CATEGORY_ALIASES;
export type CategoryQueryKey = CategoryKey | LegacyCategoryKey;
export const CATEGORY_QUERY_KEYS = [...CATEGORY_KEYS, "power-cooling", "operations", "practice", "industry", "research", "policy"] as const;

/** Website tab labels. */
export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])) as Record<CategoryKey, string>;

/** New category keys are canonical; previous keys remain accepted for bookmarked API and RSS filters. */
export const PUBLIC_API_CATEGORY_KEYS = CATEGORY_QUERY_KEYS;
export type PublicApiCategoryKey = CategoryQueryKey;

export function normalizeCategoryKey(value: unknown): CategoryKey | null {
  if (typeof value !== "string") return null;
  if ((CATEGORY_KEYS as readonly string[]).includes(value)) return value as CategoryKey;
  return LEGACY_CATEGORY_ALIASES[value as LegacyCategoryKey] ?? null;
}

export function toPublicApiCategory(category: string | null): PublicApiCategoryKey | null {
  return normalizeCategoryKey(category);
}

export function isCategoryKey(value: unknown): value is CategoryKey {
  return typeof value === "string" && (CATEGORY_KEYS as readonly string[]).includes(value);
}

export const CHANNEL_KEYS = ["all", "news", "x", "firstParty"] as const;
export type ChannelKey = (typeof CHANNEL_KEYS)[number];

export const CHANNEL_LABELS: Record<ChannelKey, string> = {
  all: "全部",
  news: "资讯",
  x: "X",
  firstParty: "一手",
};

export function isChannelKey(value: unknown): value is ChannelKey {
  return typeof value === "string" && (CHANNEL_KEYS as readonly string[]).includes(value);
}

export const LEADERBOARD_PUBLIC_BOARDS = ["overall", "coding", "reasoning", "knowledge", "professional"] as const;
export type LeaderboardBoardKey = (typeof LEADERBOARD_PUBLIC_BOARDS)[number];

export const LEADERBOARD_BOARD_LABELS: Record<LeaderboardBoardKey, string> = {
  overall: "综合",
  coding: "编程",
  reasoning: "推理",
  knowledge: "知识",
  professional: "专业办公",
};

/** Article ids. Also the local-data import validation pattern. */
export const ARTICLE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/;
