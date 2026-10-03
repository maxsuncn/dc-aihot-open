export interface DailySelectionCandidate {
  articleId: string;
  score: number | null;
  discoveredAt: Date;
}

/** Rank arrivals or fact slots; ties favor earlier discovery, then stable identity. */
export function rankDailySelection(items: DailySelectionCandidate[]): DailySelectionCandidate[] {
  return [...items].sort((a, b) => {
    const scoreA = a.score ?? Number.NEGATIVE_INFINITY;
    const scoreB = b.score ?? Number.NEGATIVE_INFINITY;
    if (scoreA !== scoreB) return scoreB > scoreA ? 1 : -1;
    return a.discoveredAt.getTime() - b.discoveredAt.getTime() || a.articleId.localeCompare(b.articleId);
  });
}

/** Keep the highest-scoring arrivals; ties favor earlier discovery, then stable article id. */
export function dailySelectionPlan(
  existing: DailySelectionCandidate[],
  candidate: DailySelectionCandidate,
  limit: number,
): { candidateSelected: boolean; evictedIds: string[] } {
  const ranked = rankDailySelection([...existing, candidate]);
  const winners = new Set(ranked.slice(0, Math.max(0, limit)).map((item) => item.articleId));
  return {
    candidateSelected: winners.has(candidate.articleId),
    evictedIds: existing.filter((item) => !winners.has(item.articleId)).map((item) => item.articleId),
  };
}
