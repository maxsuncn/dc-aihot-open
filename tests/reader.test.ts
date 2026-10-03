import assert from "node:assert/strict";
import test from "node:test";
import { enhanceReadingBody } from "../packages/backend/src/content/reader.ts";

test("interviews gain section headings, speaker labels, and restrained topic emphasis", () => {
  const html = [
    "<p>以下为对话实录（略有删节）：</p>",
    "<p>“AI与供配电的关键选择”</p>",
    "<p>新浪科技：供配电是关键问题吗？</p>",
    "<p>王志国：供配电决定稳定运行。</p>",
    "<p>记者：下一步会扩建吗？</p>",
  ].join("");

  const result = enhanceReadingBody(html, ["项目", "供配电"]);
  assert.match(result, /<h2 class="reading-section">AI与供配电的关键选择<\/h2>/);
  assert.equal((result.match(/class="reading-dialogue"/g) ?? []).length, 3);
  assert.match(result, /<strong class="reading-speaker">新浪科技：<\/strong>/);
  assert.equal((result.match(/class="reading-key-term"/g) ?? []).length, 1);
  assert.ok(result.includes("供配电决定稳定运行"));
});

test("ordinary paragraphs keep their structure unless they contain a tagged topic", () => {
  const html = "<p>供配电受到关注。</p><p>供配电是重要议题。</p>";
  const result = enhanceReadingBody(html, ["供配电"]);
  assert.equal((result.match(/<blockquote/g) ?? []).length, 0);
  assert.equal((result.match(/<h2/g) ?? []).length, 0);
  assert.equal((result.match(/class="reading-key-term"/g) ?? []).length, 1);
});
