// A daily's front-page picture comes from the item its lead is about: the editors' lead matched to an
// item by title, never simply the first highlight.
import "./setup.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReportCitation } from "@aihot/contracts/site";
import { leadItemOf } from "@aihot/backend/publication/reports";

const cite = (itemId: string, title: string) => ({ itemId, title }) as ReportCitation;
const arena = cite("a", "北美数据中心高密度机架推动电力容量与冷却需求上升");
const cooling = cite("b", "智算中心公布液冷改造计划，将新增冷却能力并开展性能验证");

test("an editors' lead is matched to the item it is written about", () => {
  assert.equal(leadItemOf("智算中心公布液冷改造计划", [arena, cooling], [arena, cooling])?.itemId, "b");
});

test("a lead that matches no item clearly has no item", () => {
  assert.equal(leadItemOf("多个数据中心项目更新建设计划", [arena], [arena, cooling]), undefined);
});

test("without an editors' lead the first highlight leads", () => {
  assert.equal(leadItemOf(undefined, [arena], [cooling, arena])?.itemId, "a");
});
