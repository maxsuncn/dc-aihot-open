// 精选的门槛。旧站将 80 分以上定义为 A 级精选、65–79 为 B 级。
// 新站采用两次独立评分的平均门槛；在没有行业人工标注集之前，先用 80 对齐旧站 A 级，暂不猜测不同信源的分差。
// 每篇资料由评分模型独立打两次分（0–100），两次之和 ≥ 2 × 门槛才进精选，卡片上显示两次的平均分。
// 积累并标注行业样本后，再用 scripts/eval-selection.ts 校准门槛（见 docs/selection.md）。

export const SELECTION = {
  /** Maximum number of selected items released per Beijing calendar day. */
  dailyCap: 15,
  /**
   * 信源分级 → 入选门槛（平均分）。当前先统一使用旧站 A 级入选线：
   *   T1 官方一手（官网、官方博客、机构）· T1_5 官方账号、准官方创作者 · T2 媒体与个人
   * 分级 EXCLUDE_MP 以及这里没有列出的分级，不参与精选评分（只进“全部动态”）。
   */
  thresholds: { T1: 80, T1_5: 80, T2: 80 } as Record<string, number>,
  /**
   * 没入选、但平均分高于这个数的资料，也用精选的写法（内容理解：标题、摘要、推荐理由、标签）来写，
   * 其余用更便宜的“标题摘要翻译”。
   */
  understandFloor: 65,
} as const;
