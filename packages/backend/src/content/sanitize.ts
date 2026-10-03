// One body representation for the web page, Markdown export and full RSS: whitelisted HTML.
// External HTML is never executed; images keep their original src and are signed at read time.
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "hr", "h2", "h3", "h4", "h5", "ul", "ol", "li", "blockquote", "pre", "code", "table", "thead", "tbody",
  "tfoot", "tr", "th", "td", "caption", "a", "img", "figure", "figcaption", "strong", "em", "b", "i", "u", "s", "del",
  "sup", "sub", "mark", "span", "dl", "dt", "dd", "picture", "video",
];

/** A class naming a promotion block (msr-promo, promo-box …), not text such as "promotion". */
const PROMO_CLASS = /(?:^|[-_])promo(?:$|[-_])/i;

/**
 * Promotions a site places inside its posts and rotates between loads (Microsoft Research puts a
 * different podcast or product box into each post of its feed). They are no part of the post, and
 * keeping them made every fetch look like a new version of the article.
 */
function dropPromotions(html: string): string {
  if (!/promo/i.test(html)) return html;
  const $ = cheerio.load(html, null, false);
  $("[class]")
    .filter((_, el) => ($(el).attr("class") ?? "").split(/\s+/).some((c) => PROMO_CLASS.test(c)))
    .remove();
  return $.html();
}

/**
 * Elements whose content is never article text: dropped with everything inside, where other unknown
 * tags are only unwrapped. A page's <template> blocks held hundreds of thousands of characters of
 * base64 that surfaced as paragraphs.
 */
const DROP_WHOLE = [
  "script", "style", "noscript", "textarea", "option", "iframe", "object", "embed", "applet", "form", "input", "select",
  "button", "label", "fieldset", "legend", "svg", "link", "meta", "base", "title", "head", "template", "audio",
  "map", "area", "frame", "frameset", "track", "source", "param",
  // MathML is unwrapped to its text; its LaTeX source and embedded markup are not text.
  "annotation", "annotation-xml", "mglyph",
];

export function sanitizeBody(html: string, baseUrl?: string): string {
  const cleaned = sanitizeHtml(dropPromotions(html), {
    allowedTags: ALLOWED_TAGS,
    nonTextTags: DROP_WHOLE,
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height", "title"],
      video: ["src", "poster", "width", "height"],
      code: ["class"],
      pre: ["class"],
      th: ["colspan", "rowspan", "align"],
      td: ["colspan", "rowspan", "align"],
      span: [],
    },
    allowedClasses: { code: [/^language-[\w-]+$/], pre: [/^language-[\w-]+$/] },
    allowedSchemes: ["http", "https"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowProtocolRelative: true,
    transformTags: {
      h1: "h2",
      h6: "h5",
      div: (tagName, attribs) => ({ tagName: "p", attribs }),
      section: "p",
      article: "p",
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, ...(attribs.href ? { href: resolveUrl(attribs.href, baseUrl) } : {}) },
      }),
      img: (tagName, attribs) => {
        const src = unwrapProxyUrl(attribs["data-src"] || attribs["data-original"] || attribs.src || "");
        return { tagName, attribs: { ...attribs, src: resolveUrl(src, baseUrl) } };
      },
      video: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, ...(attribs.poster ? { poster: resolveUrl(unwrapProxyUrl(attribs.poster), baseUrl) } : {}) },
      }),
    },
    // Empty paragraphs go in normalizeBlocks, which sees nested images: a frame only knows its direct
    // children, and a paragraph holding a linked chart (<p><a><img></a></p>) looked empty here.
    exclusiveFilter: (frame) =>
      (frame.tag === "img" && !frame.attribs.src) ||
      (frame.tag === "a" && !frame.text.trim() && !frame.mediaChildren?.length),
  });
  return normalizeBlocks(cleanArticleImages(cleaned));
}

const IMAGE_DECORATION = /(?:^|[\/_\-.])(?:arrow|icon|sprite|avatar|logo|badge|share|wechat|qrcode|qr-code|ad|ads|advert|advertisement|promo|promotion|banner|poster|campaign|signup|register|consultation|sponsor|activity|cartoon|illustration|mascot|sticker|emoji)(?:$|[\/_\-.])/i;
const CHINESE_DECORATION = /(?:箭头|卡通|表情包|插画|吉祥物)/i;
const EVIDENCE_IMAGE = /(?:图表|表格|名单|列表|排名|排行|统计|数据|架构图|拓扑图|示意图|流程图|参数|方案图|技术图|模型对比|负载曲线|能效曲线|table|chart|diagram|architecture|topology|ranking|ranked|metrics|schematic)/i;
const PROMO_TEXT = /(?:扫码|报名|注册参会|合作洽谈|商务合作|广告|赞助|立即咨询|点击了解|活动海报|大会报名|会议报名|展会报名|扫码报名|扫码关注|扫码咨询|长按识别)/i;
const TINY_IMAGE = (value: string | undefined) => !!value && /^\d{1,2}$/.test(value.trim());

function imageIdentity(src: string): string {
  try {
    const url = new URL(src);
    // Query strings commonly contain cache-busters, signatures and tracking. The path identifies
    // the same editorial image while avoiding a fetch just to compare its pixels.
    return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/{2,}/g, "/")}`.replace(/\/$/, "");
  } catch {
    return src.split(/[?#]/, 1)[0]!.toLowerCase();
  }
}

/** Keep article evidence and useful diagrams; discard repeated, decorative and obvious campaign art. */
function cleanArticleImages(html: string): string {
  if (!/<img\b/i.test(html)) return html;
  const $ = cheerio.load(html, null, false);
  const seen = new Set<string>();
  $("img").each((_, el) => {
    const img = $(el);
    const src = img.attr("src") ?? "";
    const metadata = [src, img.attr("alt"), img.attr("title")].filter(Boolean).join(" ");
    const dimensions = [img.attr("width"), img.attr("height")];
    const nearby = img.parent().text() + " " + img.parent().prev().text() + " " + img.parent().next().text();
    const identity = imageIdentity(src);
    const animated = /\.gif(?:$|[?#])/i.test(src) || /^data:image\/gif/i.test(src);
    const informative = EVIDENCE_IMAGE.test(metadata);
    const obviousDecoration = !informative && (CHINESE_DECORATION.test(metadata) || IMAGE_DECORATION.test(metadata) || PROMO_TEXT.test(`${metadata} ${nearby}`));
    const tiny = dimensions.some(TINY_IMAGE);
    if (!src || animated || obviousDecoration || tiny || seen.has(identity)) {
      img.remove();
      return;
    }
    seen.add(identity);
  });
  $("picture").each((_, el) => { if (!$(el).find("img").length) $(el).remove(); });
  $("figure").each((_, el) => { if (!$(el).find("img, video").length && !$(el).text().trim()) $(el).remove(); });
  return $.html();
}

const BLOCK_TAGS = new Set(["p", "h2", "h3", "h4", "h5", "ul", "ol", "li", "blockquote", "pre", "table", "figure", "hr", "dl", "picture", "video"]);

/**
 * Re-parses the sanitised HTML the way browsers do: a block element closes an open paragraph, so
 * containers turned into <p> (nested divs) no longer leave nested or empty paragraphs behind. Empty
 * paragraphs are dropped and loose top-level text is wrapped in its own paragraph.
 */
export function normalizeBlocks(html: string): string {
  const $ = cheerio.load(html, null, false);
  $("p").each((_, el) => {
    const p = $(el);
    if (!p.text().trim() && !p.find("img, video, picture").length) p.remove();
  });
  const out: string[] = [];
  let run: string[] = [];
  let meaningful = false;
  const flush = () => {
    if (meaningful) out.push(`<p>${run.join("").trim()}</p>`);
    run = [];
    meaningful = false;
  };
  for (const node of $.root().contents().toArray()) {
    if (node.type === "tag" && BLOCK_TAGS.has(node.name)) {
      flush();
      out.push($.html(node));
    } else if (node.type === "text" || node.type === "tag") {
      run.push($.html(node));
      if ($(node).text().trim() || (node.type === "tag" && $(node).is("img, a:has(img), br") && node.name !== "br")) meaningful = true;
    }
  }
  flush();
  return out.join("").trim();
}

/**
 * Short blocks a news page puts after the article (TechCrunch ends in "Topics", "Subscribe for the
 * industry's biggest tech news", "Latest in AI"). Only headings and calls to action without a full
 * stop, only at the very end of an extracted page, one block at a time: an article's own sentences stay.
 */
const TRAILING_CHROME = [
  /^topics$/i, /^tags?$/i, /^latest in [\p{L}\s&-]{1,30}$/iu, /^latest (?:news|stories)$/i, /^most (?:popular|read)$/i,
  /^related (?:articles|posts|stories|content|reading|coverage)$/i, /^more (?:stories|articles|news)$/i, /^(?:keep reading|read next|up next)$/i,
  /^(?:you (?:might|may) also like|recommended(?: for you)?)$/i, /^(?:subscribe|sign up)\b.{0,80}$/i, /^share (?:this|on)\b.{0,40}$/i,
  /^follow us\b.{0,40}$/i, /^advertisement$/i,
];

export function trimTrailingChrome(html: string): string {
  const $ = cheerio.load(html, null, false);
  let blocks = $.root().children().toArray();
  let removed = false;
  while (blocks.length > 1) {
    const last = $(blocks[blocks.length - 1]!);
    const text = collapse(last.text());
    if (last.find("img, video, picture").length || /[.。!！?？:：]$/.test(text) || !TRAILING_CHROME.some((re) => re.test(text))) break;
    last.remove();
    blocks = blocks.slice(0, -1);
    removed = true;
  }
  return removed ? $.html() : html;
}

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

const OWN_PROXY = /^(?:https?:\/\/[^/?#]+)?\/api\/img-proxy\?/i;

/**
 * The image an address of our own image proxy stands for. Legacy bodies were saved with the proxy's
 * relative address (`/api/img-proxy?u=…&exp=…&sig=…`); resolved against the article's own site it
 * pointed nowhere. The source image is the `u` it wraps, signed again when a page is served.
 */
export function unwrapProxyUrl(src: string): string {
  const s = src.trim();
  if (!OWN_PROXY.test(s)) return src;
  const u = new URLSearchParams(s.slice(s.indexOf("?") + 1).replace(/&amp;/g, "&")).get("u");
  return u && /^https?:\/\//i.test(u) ? u : src;
}

/** Stored bodies: every image and video poster wrapped in our proxy points at its source again. */
export function unwrapProxiedImages(html: string): string {
  // Quoted attribute values may hold a ">" (an alt text), so a tag ends only outside quotes.
  return html.replace(/<(?:img|video)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, (tag) =>
    tag.replace(/(\s(?:src|poster)=")([^"]*)(")/gi, (match, pre: string, value: string, post: string) => {
      const url = value.replace(/&amp;/g, "&");
      const unwrapped = unwrapProxyUrl(url);
      return unwrapped === url ? match : `${pre}${unwrapped.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}${post}`;
    }),
  );
}

function resolveUrl(href: string, base?: string): string {
  if (!href) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

/** Plain paragraphs to HTML, for sources that only give text (X posts, translations). */
export function textToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${esc(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
