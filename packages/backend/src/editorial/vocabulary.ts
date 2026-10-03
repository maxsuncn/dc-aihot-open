// Tag normalization over the industry pack's vocabulary (industry/taxonomy.ts), which the topics
// (industry/topics.json) are built on.
import { CATEGORIES, ENTITIES, CATEGORY_TAGS, DEFAULT_CATEGORY_TAG, ENTITY_TAGS, RELEASE, TAG_SYNONYMS, TOPIC_TAGS } from "@aihot/industry/taxonomy";

export { CATEGORY_BY_ITEM_TYPE, CATEGORY_TAGS, ENTITIES, ENTITY_TAGS, ITEM_TYPES, TOPIC_TAGS } from "@aihot/industry/taxonomy";

const ALLOWED_TAGS = new Set<string>([...CATEGORY_TAGS, ...TOPIC_TAGS, ...ENTITY_TAGS]);

/**
 * Known tags only, synonyms mapped, duplicates dropped, at most `max`; the category tag goes first. A list
 * without one gets `fallbackCategory` (deterministic, no repair call).
 */
export function normalizeTags(v: unknown, opts: { max?: number; fallbackCategory?: string } = {}): string[] {
  const max = opts.max ?? 6;
  const raw = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,，]/g) : [];
  const tags: string[] = [];
  for (const x of raw) {
    const t = String(x ?? "").trim().replace(/^#/, "");
    const tag = TAG_SYNONYMS[t] ?? TAG_SYNONYMS[t.toLowerCase()] ?? t;
    if (tag && ALLOWED_TAGS.has(tag) && !tags.includes(tag)) tags.push(tag);
  }
  const isCategory = (t: string) => (CATEGORY_TAGS as readonly string[]).includes(t);
  const categoryIndex = tags.findIndex(isCategory);
  const category = categoryIndex >= 0 ? tags[categoryIndex]! : (opts.fallbackCategory ?? DEFAULT_CATEGORY_TAG);
  return [category, ...tags.filter((t) => t !== category)].slice(0, max);
}

/** The category guide the structure step reads: one line per category. */
export const CATEGORY_GUIDE = CATEGORIES.map((c) => `- ${c.key}（${c.label}）：${c.guide}`).join("\n");

/** The industry's headline launch (RELEASE): narrower than its category, which also holds prices and benchmarks. */
export const isRelease = (category: string | null, tags: readonly string[]) => RELEASE !== null && category === RELEASE.category && tags.includes(RELEASE.tag);

const key = (value: string) => value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "");
/** Exact entity/alias only: mentions embedded in a sentence are not ownership. */
export function entityIdentity(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const normalized = key(value);
  const matches = Object.entries(ENTITIES).filter(([id, entity]) => [id, entity.name, ...entity.aliases, ...(entity.otherNames ?? [])].some((alias) => key(alias) === normalized));
  return matches.length > 1 ? null : matches[0]?.[0] ?? null;
}
