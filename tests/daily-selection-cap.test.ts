import test from "node:test";
import assert from "node:assert/strict";
import { dailySelectionPlan } from "../packages/backend/src/publication/daily-cap.ts";

const at = (minute: number) => new Date(`2026-09-30T02:${String(minute).padStart(2, "0")}:00Z`);
const item = (articleId: string, score: number | null, minute: number) => ({ articleId, score, discoveredAt: at(minute) });

test("daily selection keeps the highest scores and evicts the lowest when a stronger item arrives", () => {
  const plan = dailySelectionPlan([item("a", 80, 10), item("b", 90, 20)], item("c", 95, 30), 2);
  assert.equal(plan.candidateSelected, true);
  assert.deepEqual(plan.evictedIds, ["a"]);
});

test("daily selection does not force a candidate below the top-N into the selected set", () => {
  const plan = dailySelectionPlan([item("a", 98, 10), item("b", 90, 20)], item("c", 80, 30), 2);
  assert.equal(plan.candidateSelected, false);
  assert.deepEqual(plan.evictedIds, []);
});

test("daily selection uses discovery time and id as deterministic tie-breakers", () => {
  const plan = dailySelectionPlan([item("a", 90, 10), item("b", 90, 20)], item("c", 90, 20), 2);
  assert.equal(plan.candidateSelected, false);
  assert.deepEqual(plan.evictedIds, []);
});
