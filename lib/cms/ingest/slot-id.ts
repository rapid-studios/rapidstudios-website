// lib/cms/ingest/slot-id.ts
// Stable, deterministic slot IDs so re-ingesting the same page produces the
// same IDs (idempotent ingest). Hash of (DOM path + role).

import { createHash } from "node:crypto";
import type { CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

export function domPath($: CheerioAPI, el: AnyNode): string {
  const parts: string[] = [];
  let node: AnyNode | null = el;
  while (node && (node as { type?: string }).type === "tag") {
    const tagNode = node as unknown as { name: string; parent: AnyNode | null };
    const tag = tagNode.name;
    const parent = tagNode.parent as (AnyNode & { children?: AnyNode[] }) | null;
    let index = 1;
    if (parent && parent.children) {
      const sameTagSiblings = parent.children.filter(
        (cNode: AnyNode) => (cNode as { type?: string }).type === "tag" && (cNode as Element).name === tag
      );
      index = sameTagSiblings.indexOf(node) + 1;
    }
    parts.unshift(`${tag}:nth-of-type(${index})`);
    node = parent && (parent as { type?: string }).type === "tag" ? parent : null;
  }
  return parts.join(">");
}

export function makeSlotId(role: string, path: string): string {
  const h = createHash("sha1").update(`${role}::${path}`).digest("hex").slice(0, 10);
  return `${role}_${h}`;
}
