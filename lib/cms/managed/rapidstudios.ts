import type { Collection } from "mongodb";

import { MANAGED_HOMEPAGE_MANIFEST, MANAGED_HOMEPAGE_PUBLISH_TARGET } from "@/lib/content/managed-site-manifest";
import { createManagedHomepageContentMap, getManagedHomepageSnapshot } from "@/lib/content/managed-site";
import { getCmsMongoDb } from "@/lib/cms/store/mongo-client";
import type { Page, Site, Snapshot } from "@/lib/cms/types";

export interface ManagedRapidStudiosSeedResult {
  site: Site;
  createdSite: boolean;
  createdPage: boolean;
}

function managedPreviewTemplate(): string {
  const groups = new Map<string, typeof MANAGED_HOMEPAGE_MANIFEST[number][]>();
  for (const definition of MANAGED_HOMEPAGE_MANIFEST) {
    if (definition.key.startsWith("home.meta.")) continue;
    const group = definition.key.split(".")[1] || "page";
    const items = groups.get(group) ?? [];
    items.push(definition);
    groups.set(group, items);
  }
  const sections = [...groups.entries()].map(([group, definitions]) => {
    const fields = definitions.map((definition, index) => {
      const tag = definition.type === "button" ? "button" : index === 0 ? "h2" : "p";
      const attributes = definition.type === "button" ? ' type="button"' : "";
      return `<${tag}${attributes} data-slot="${definition.slotId}"></${tag}>`;
    }).join("\n");
    return `<section aria-label="${group.replace(/-/g, " ")}"><div class="shell">${fields}</div></section>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Rapid Studios managed homepage</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:var(--cms-bg,#101822);color:var(--cms-text,#f3f7ff);font:18px/1.6 var(--cms-body-font,system-ui,sans-serif)}
    section{padding:clamp(3rem,7vw,6rem) 0;border-bottom:1px solid color-mix(in srgb,var(--cms-text,#fff) 12%,transparent)}section:nth-of-type(even){background:var(--cms-surface,#121c2a)}
    .shell{width:min(1120px,calc(100% - 2rem));margin-inline:auto}h2{max-width:20ch;margin:0 0 1rem;font:800 clamp(2rem,5vw,4rem)/1.12 var(--cms-heading-font,system-ui,sans-serif);letter-spacing:-.03em;text-wrap:balance}
    p{max-width:68ch;margin:.65rem 0;color:var(--cms-muted,#8fa8c9);text-wrap:pretty}button{min-height:44px;margin-top:1.25rem;border:0;border-radius:var(--cms-radius,14px);background:var(--cms-accent,#3b8af0);color:var(--cms-accent-text,#fff);padding:.75rem 1.1rem;font:700 1rem/1.2 inherit}
    :focus-visible{outline:3px solid var(--cms-accent,#3b8af0);outline-offset:3px}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition-duration:.01ms!important}}
  </style>
</head>
<body><main>${sections}</main></body>
</html>`;
}

function bootstrapPage(createdAt: string): Page {
  const snapshot = getManagedHomepageSnapshot();
  const contentMap = createManagedHomepageContentMap(snapshot.slots);
  const version: Snapshot = {
    id: "snap_managed_bootstrap",
    createdAt,
    contentMap: structuredClone(contentMap),
    publishedDeploymentUrl: "https://rapidstudios.dev",
  };
  return {
    id: MANAGED_HOMEPAGE_PUBLISH_TARGET.pageId,
    route: MANAGED_HOMEPAGE_PUBLISH_TARGET.route,
    template: managedPreviewTemplate(),
    contentMap,
    versions: [version],
    pendingChanges: [],
  };
}

export async function ensureManagedRapidStudiosSite(): Promise<ManagedRapidStudiosSeedResult> {
  const db = await getCmsMongoDb();
  const collectionName = process.env.MONGODB_COLLECTION || "sites";
  const sites = db.collection<Site>(collectionName) as Collection<Site>;
  await sites.createIndex({ id: 1 }, { unique: true });
  const existing = await sites.findOne({ id: MANAGED_HOMEPAGE_PUBLISH_TARGET.siteId });
  if (existing) {
    const clean = { ...existing } as Site & { _id?: unknown };
    delete clean._id;
    await sites.updateOne(
      { id: MANAGED_HOMEPAGE_PUBLISH_TARGET.siteId },
      { $set: { name: "Rapid Studios", domain: MANAGED_HOMEPAGE_PUBLISH_TARGET.domain, requiresApproval: true } }
    );
    clean.name = "Rapid Studios";
    clean.domain = MANAGED_HOMEPAGE_PUBLISH_TARGET.domain;
    clean.requiresApproval = true;
    if (clean.pages.some((page) => page.id === MANAGED_HOMEPAGE_PUBLISH_TARGET.pageId)) {
      return { site: clean, createdSite: false, createdPage: false };
    }
    const page = bootstrapPage(new Date().toISOString());
    await sites.updateOne(
      { id: MANAGED_HOMEPAGE_PUBLISH_TARGET.siteId, "pages.id": { $ne: page.id } },
      { $push: { pages: page } }
    );
    const updated = await sites.findOne({ id: MANAGED_HOMEPAGE_PUBLISH_TARGET.siteId });
    if (!updated) throw new Error("Managed site disappeared while its homepage was being created.");
    const updatedClean = { ...updated } as Site & { _id?: unknown };
    delete updatedClean._id;
    return { site: updatedClean, createdSite: false, createdPage: true };
  }

  const createdAt = new Date().toISOString();
  const snapshot = getManagedHomepageSnapshot();
  const site: Site = {
    id: MANAGED_HOMEPAGE_PUBLISH_TARGET.siteId,
    name: "Rapid Studios",
    domain: MANAGED_HOMEPAGE_PUBLISH_TARGET.domain,
    requiresApproval: true,
    clientPasswordHash: null,
    theme: snapshot.theme,
    pages: [bootstrapPage(createdAt)],
    createdAt,
  };
  try {
    await sites.insertOne(structuredClone(site));
    return { site, createdSite: true, createdPage: true };
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const raced = await sites.findOne({ id: site.id });
    if (!raced) throw error;
    const clean = { ...raced } as Site & { _id?: unknown };
    delete clean._id;
    return { site: clean, createdSite: false, createdPage: clean.pages.some((page) => page.id === MANAGED_HOMEPAGE_PUBLISH_TARGET.pageId) };
  }
}
