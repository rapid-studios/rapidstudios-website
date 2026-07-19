// lib/cms/ingest/parse.ts
// Turn rendered HTML into a frozen template (locked design) + a content map
// (the only mutable surface). Every editable text / image / button / link
// becomes a {{slot_id}} placeholder; its value lives in the map.

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import { domPath, makeSlotId } from "./slot-id";
import { IMAGE_URL_SCHEMES, LINK_URL_SCHEMES, sanitizeUrl } from "../guardian";
import type { ContentMap, SlotConstraints, SlotType } from "../types";

const TEXT_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "span", "li", "label", "figcaption",
  "blockquote", "strong", "em", "small", "td", "th",
]);

const SKIP_TAGS = new Set(["script", "style", "noscript", "template", "head"]);

const ACTIVE_ELEMENTS = new Set([
  "script",
  "base",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "portal",
  "foreignobject",
  "animate",
  "animatemotion",
  "animatetransform",
  "set",
]);

/** Remove executable markup and normalize URL-bearing editable elements. */
export function sanitizeDocument($: CheerioAPI): void {
  $("*").filter((_i, el) => {
    const tagName = (el as unknown as { name?: string; tagName?: string }).name ||
      (el as unknown as { tagName?: string }).tagName || "";
    return ACTIVE_ELEMENTS.has(tagName.toLowerCase());
  }).remove();
  $("meta").filter((_i, el) => {
    const httpEquiv = ($(el).attr("http-equiv") || "").trim().toLowerCase();
    return httpEquiv === "refresh" || httpEquiv === "content-security-policy";
  }).remove();
  $("link").filter((_i, el) => {
    const rel = ($(el).attr("rel") || "").toLowerCase().split(/\s+/);
    const as = ($(el).attr("as") || "").toLowerCase();
    return rel.includes("import") || rel.includes("modulepreload") || (rel.includes("preload") && as === "script");
  }).remove();

  $("*").each((_i, el) => {
    const $el = $(el);
    for (const attrName of Object.keys((el as unknown as { attribs?: Record<string, string> }).attribs || {})) {
      const lower = attrName.toLowerCase();
      if (
        lower.startsWith("on") ||
        lower === "srcdoc" ||
        lower === "nonce" ||
        lower === "srcset" ||
        lower === "imagesrcset"
      ) {
        $el.removeAttr(attrName);
      }
    }

    const style = $el.attr("style");
    if (style && /(?:expression\s*\(|url\s*\(\s*["']?\s*(?:javascript|vbscript|data\s*:\s*text\/html))/i.test(style)) {
      $el.removeAttr("style");
    }
  });

  $("a[href]").each((_i, el) => {
    const $el = $(el);
    const safeHref = sanitizeUrl($el.attr("href"), LINK_URL_SCHEMES, "link");
    if (safeHref === null) $el.removeAttr("href");
    else $el.attr("href", safeHref);

    if (($el.attr("target") || "").toLowerCase() === "_blank") {
      const rel = new Set(($el.attr("rel") || "").toLowerCase().split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      $el.attr("rel", Array.from(rel).join(" "));
    }
    $el.removeAttr("ping");
  });

  $("img[src]").each((_i, el) => {
    const $el = $(el);
    const safeSrc = sanitizeUrl($el.attr("src"), IMAGE_URL_SCHEMES, "image");
    if (safeSrc === null) $el.removeAttr("src");
    else $el.attr("src", safeSrc);
  });

  $("[href]").not("a").each((_i, el) => {
    const $el = $(el);
    const safeHref = sanitizeUrl($el.attr("href"), ["http:", "https:"], "link");
    if (safeHref === null) $el.removeAttr("href");
    else $el.attr("href", safeHref);
  });

  $("[src]").not("img").each((_i, el) => {
    const $el = $(el);
    const safeSrc = sanitizeUrl($el.attr("src"), ["http:", "https:"], "link");
    if (safeSrc === null) $el.removeAttr("src");
    else $el.attr("src", safeSrc);
  });

  $("[action], [formaction]").each((_i, el) => {
    const $el = $(el);
    for (const attrName of ["action", "formaction"] as const) {
      const value = $el.attr(attrName);
      if (value === undefined) continue;
      const safe = sanitizeUrl(value, ["http:", "https:"], "link");
      if (safe === null) $el.removeAttr(attrName);
      else $el.attr(attrName, safe);
    }
  });

  // SVG links can use either spelling and are not part of editable anchor slots.
  $("[xlink\\:href]").each((_i, el) => {
    const $el = $(el);
    const value = $el.attr("xlink:href");
    const safe = sanitizeUrl(value, ["http:", "https:"], "link");
    if (safe === null) $el.removeAttr("xlink:href");
    else $el.attr("xlink:href", safe);
  });
}

export function parseToTemplate(html: string): { template: string; contentMap: ContentMap } {
  const $ = cheerio.load(html);
  sanitizeDocument($);
  const contentMap: ContentMap = {};

  // 1) Images -> image slots (src value)
  $("img").each((_i, el) => {
    if (isInsideSkipped(el)) return;
    const path = domPath($, el);
    const src = sanitizeUrl($(el).attr("src") || "", IMAGE_URL_SCHEMES, "image") || "";
    const id = makeSlotId("image", path);
    contentMap[id] = {
      type: "image",
      value: src,
      constraints: defaultConstraints("image"),
      alt: $(el).attr("alt") || "",
    };
    $(el).attr("src", `{{${id}}}`);
    $(el).attr("data-slot", id);
  });

  // 2) Buttons + anchors-as-buttons -> button/link slots
  $("a, button").each((_i, el) => {
    if (isInsideSkipped(el)) return;
    const $el = $(el);
    const hasElementChildren = $el.children().length > 0;
    const text = $el.text().trim();
    if (!text || hasElementChildren) return;

    const path = domPath($, el);
    const isLink = (el as unknown as { name: string }).name === "a";
    const role: SlotType = isLink ? "link" : "button";
    const id = makeSlotId(role, path);
    contentMap[id] = {
      type: role,
      value: text,
      constraints: defaultConstraints(role),
      ...(isLink ? { href: sanitizeUrl($el.attr("href") || "", LINK_URL_SCHEMES, "link") || "" } : {}),
    };
    $el.text(`{{${id}}}`);
    $el.attr("data-slot", id);
  });

  // 3) Leaf text elements -> text slots
  $(Array.from(TEXT_TAGS).join(",")).each((_i, el) => {
    if (isInsideSkipped(el)) return;
    const $el = $(el);
    if ($el.children().length > 0) return;
    if ($el.attr("data-slot")) return;
    const text = $el.text().trim();
    if (!text) return;

    const path = domPath($, el);
    const id = makeSlotId("text", path);
    contentMap[id] = {
      type: "text",
      value: text,
      constraints: defaultConstraints("text"),
    };
    $el.text(`{{${id}}}`);
    $el.attr("data-slot", id);
  });

  const template = $.html();
  return { template, contentMap };
}

function isInsideSkipped(el: AnyNode): boolean {
  let node: AnyNode | null = el;
  while (node) {
    const n = node as { type?: string; name?: string; parent?: AnyNode | null };
    if (n.type === "tag" && n.name && SKIP_TAGS.has(n.name)) return true;
    node = n.parent ?? null;
  }
  return false;
}

function defaultConstraints(role: SlotType): SlotConstraints {
  switch (role) {
    case "text":
      return { maxLength: 5000, required: true, allowHtml: false };
    case "button":
      return { maxLength: 80, required: true, allowHtml: false };
    case "link":
      return { maxLength: 200, required: true, allowHtml: false };
    case "image":
      return { required: true, schemes: [...IMAGE_URL_SCHEMES] };
    default:
      return {};
  }
}
