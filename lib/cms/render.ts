// lib/cms/render.ts
// Render a frozen template + content map back into HTML. Shared by preview,
// edit-preview, and publish so they can never diverge.

import * as cheerio from "cheerio";
import { IMAGE_URL_SCHEMES, LINK_URL_SCHEMES, sanitizeUrl } from "./guardian";
import { sanitizeDocument } from "./ingest/parse";
import type { ContentMap } from "./types";

export function render(template: string, contentMap: ContentMap): string {
  const $ = cheerio.load(template);
  sanitizeDocument($);

  $("[data-slot]").each((_i, el) => {
    const $el = $(el);
    const slotId = $el.attr("data-slot");
    if (!slotId || !Object.prototype.hasOwnProperty.call(contentMap, slotId)) return;
    const slot = contentMap[slotId];

    if (slot.type === "image") {
      const safeSrc = sanitizeUrl(slot.value, slot.constraints?.schemes || IMAGE_URL_SCHEMES, "image");
      if (safeSrc === null) $el.removeAttr("src");
      else $el.attr("src", safeSrc);
      if (typeof slot.alt === "string") $el.attr("alt", slot.alt);
      return;
    }

    // Cheerio's DOM setters provide the correct text/attribute escaping. Never
    // interpolate slot data into the HTML source string.
    $el.text(typeof slot.value === "string" ? slot.value : "");
    if (slot.type === "link" && typeof slot.href === "string") {
      const safeHref = sanitizeUrl(slot.href, LINK_URL_SCHEMES, "link");
      if (safeHref === null) $el.removeAttr("href");
      else $el.attr("href", safeHref);
    }
  });

  return $.html();
}

/** Add a CSP meta element so fetched HTML keeps its policy when used as srcdoc. */
export function injectContentSecurityPolicy(html: string, policy: string): string {
  const $ = cheerio.load(html);
  $("meta").filter((_i, el) => ($(el).attr("http-equiv") || "").trim().toLowerCase() === "content-security-policy").remove();
  const meta = $("<meta>").attr("http-equiv", "Content-Security-Policy").attr("content", policy);
  let $head = $("head").first();
  if ($head.length === 0) {
    $("html").prepend("<head></head>");
    $head = $("head").first();
  }
  $head.prepend(meta);
  return $.html();
}
