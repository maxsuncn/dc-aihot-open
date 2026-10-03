// Display-only article structure. The stored source body remains unchanged and page reads stay model-free.
import * as cheerio from "cheerio";

const CATEGORY_TAGS = new Set(["技术", "项目", "玩家", "市场", "白皮书", "政策", "全部"]);
const TRANSCRIPT_INTRO = /(?:以下为|以下是).{0,16}(?:对话|采访|问答).{0,8}(?:实录|记录)?|(?:对话|采访|问答)实录/u;
const SPEAKER = /^([\s\u3000]*)([^\s：:，。；！？]{2,16}[：:])\s*/u;
const QUOTED_HEADING = /^[“「『"]([^”」』"]{4,90})[”」』"]$/u;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readingTerms(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.replace(/^#+/, "").trim()))]
    .filter((tag) => tag && !CATEGORY_TAGS.has(tag) && (/[\u3400-\u9fff]{2}/u.test(tag) || /^[A-Z0-9]{2,8}$/u.test(tag) || tag.length >= 4))
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);
}

function emphasizeFirstMatch(html: string, term: string): { html: string; changed: boolean } {
  // Restrict matching to visible text nodes in a paragraph; never rewrite attributes or existing markup.
  const pattern = new RegExp(`(^|>)([^<>]*?)(${escapeRegExp(term)})(?=[^<>]*(?:<|$))`, "iu");
  let changed = false;
  const next = html.replace(pattern, (_match, boundary: string, before: string, found: string) => {
    changed = true;
    return `${boundary}${before}<strong class="reading-key-term">${found}</strong>`;
  });
  return { html: next, changed };
}

/** Adds restrained reading structure from existing editorial tags and explicit interview markers. */
export function enhanceReadingBody(html: string, tags: string[] = []): string {
  if (!html) return html;
  const $ = cheerio.load(html, null, false);
  const blocks = $.root().children().toArray();
  const paragraphs = blocks.filter((node) => node.type === "tag" && node.name === "p");
  const intro = paragraphs.findIndex((node) => TRANSCRIPT_INTRO.test($(node).text().trim()));
  const candidateParagraphs = intro >= 0 ? paragraphs.slice(intro + 1) : paragraphs;
  const speakerCount = candidateParagraphs.filter((node) => SPEAKER.test($(node).text())).length;
  const isTranscript = speakerCount >= (intro >= 0 ? 3 : 5);

  if (isTranscript) {
    let afterIntro = intro < 0;
    for (const node of blocks) {
      if (node.type !== "tag" || node.name !== "p") continue;
      const paragraph = $(node);
      const text = paragraph.text().trim();
      if (!afterIntro) {
        if (TRANSCRIPT_INTRO.test(text)) afterIntro = true;
        continue;
      }

      const heading = QUOTED_HEADING.exec(text);
      if (heading && text.length <= 96) {
        paragraph.replaceWith($("<h2 class=\"reading-section\"></h2>").text(heading[1]!));
        continue;
      }

      const first = paragraph.contents().first();
      if (first.length && first[0]?.type === "text") {
        const firstText = first.text();
        const speaker = SPEAKER.exec(firstText);
        if (speaker) {
          const label = speaker[2]!.replace(/[：:]$/, "");
          first.replaceWith($("<span></span>").text(firstText.slice(speaker[0].length)));
          paragraph.prepend($(`<strong class=\"reading-speaker\"></strong>`).text(`${label}：`));
          paragraph.wrap("<blockquote class=\"reading-dialogue\"></blockquote>");
        }
      }
    }
  }

  const terms = readingTerms(tags);
  if (terms.length) {
    let emphasized = 0;
    for (const term of terms) {
      let found = false;
      for (const node of $("p").toArray()) {
        const paragraph = $(node);
        if (paragraph.find("strong").not(".reading-speaker").length) continue;
        const result = emphasizeFirstMatch(paragraph.html() ?? "", term);
        if (result.changed) {
          paragraph.html(result.html);
          found = true;
          emphasized += 1;
          break;
        }
      }
      if (!found) continue;
      if (emphasized >= 4) break;
    }
  }

  return $.root().html() ?? html;
}
