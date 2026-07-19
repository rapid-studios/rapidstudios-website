// lib/cms/store/file-store.ts
// Filesystem store (one JSON document per site). For local dev. Implements
// CmsStore. Each accepted batch creates an immutable content SNAPSHOT.
// NOTE: not suitable for Vercel serverless (read-only / ephemeral FS) — use
// the Mongo store in production.

import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "./id";
import type { CmsStore, Site, Page, ContentMap, Snapshot, PendingEntry, ProposedChange, SiteSummary, OwnerAccount } from "../types";

// Keep the default statically scoped so Next's file tracer does not include the
// whole repository. Tests may still provide an absolute temporary directory.
const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data");

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}
function sitePath(siteId: string): string {
  return path.join(DATA_DIR, `${siteId}.json`);
}
async function saveSite(site: Site): Promise<Site> {
  await fs.writeFile(sitePath(site.id), JSON.stringify(site, null, 2));
  return site;
}

async function createSite(input: { name?: string; domain?: string; requiresApproval?: boolean }): Promise<Site> {
  await ensureDir();
  const id = `site_${nanoid(8)}`;
  const site: Site = {
    id,
    name: input.name || id,
    domain: input.domain || null,
    requiresApproval: input.requiresApproval ?? true,
    clientPasswordHash: null,
    pages: [],
    createdAt: new Date().toISOString(),
  };
  await saveSite(site);
  return site;
}

async function getSite(siteId: string): Promise<Site | null> {
  try {
    const raw = await fs.readFile(sitePath(siteId), "utf8");
    return JSON.parse(raw) as Site;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function listSites(): Promise<SiteSummary[]> {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  const sites: SiteSummary[] = [];
  for (const f of files) {
    if (!f.endsWith(".json") || f === "_owners.json") continue;
    const raw = await fs.readFile(path.join(DATA_DIR, f), "utf8");
    const s = JSON.parse(raw) as Site;
    sites.push({ id: s.id, name: s.name, domain: s.domain, pages: s.pages.length });
  }
  return sites;
}

async function addPage(siteId: string, input: { route?: string; template: string; contentMap: ContentMap }): Promise<Page> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  const snapshot: Snapshot = {
    id: `snap_${nanoid(8)}`,
    createdAt: new Date().toISOString(),
    contentMap: input.contentMap,
    publishedDeploymentUrl: null,
  };
  const page: Page = {
    id: `page_${nanoid(8)}`,
    route: input.route || "/",
    template: input.template,
    contentMap: input.contentMap,
    versions: [snapshot],
    pendingChanges: [],
  };
  site.pages.push(page);
  await saveSite(site);
  return page;
}

async function getPage(siteId: string, pageId: string): Promise<Page | null> {
  const site = await getSite(siteId);
  if (!site) return null;
  return site.pages.find((p) => p.id === pageId) || null;
}

async function commitContent(siteId: string, pageId: string, nextContentMap: ContentMap): Promise<{ page: Page; snapshot: Snapshot }> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  page.contentMap = nextContentMap;
  const snapshot: Snapshot = {
    id: `snap_${nanoid(8)}`,
    createdAt: new Date().toISOString(),
    contentMap: structuredClone(nextContentMap),
    publishedDeploymentUrl: null,
  };
  page.versions.push(snapshot);
  await saveSite(site);
  return { page, snapshot };
}

async function rollback(siteId: string, pageId: string, snapshotId: string): Promise<Page> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  const snap = page.versions.find((v) => v.id === snapshotId);
  if (!snap) throw new Error(`Snapshot not found: ${snapshotId}`);
  page.contentMap = structuredClone(snap.contentMap);
  await saveSite(site);
  return page;
}

async function setSiteAuth(siteId: string, patch: { clientPasswordHash?: string | null; requiresApproval?: boolean }): Promise<Site> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  if (patch.clientPasswordHash !== undefined) site.clientPasswordHash = patch.clientPasswordHash;
  if (patch.requiresApproval !== undefined) site.requiresApproval = patch.requiresApproval;
  await saveSite(site);
  return site;
}

async function setTheme(siteId: string, theme: import("../design/tokens").ThemeTokens | null): Promise<Site> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  site.theme = theme;
  await saveSite(site);
  return site;
}

async function queueChanges(siteId: string, pageId: string, changes: ProposedChange[], proposedBy: "client" | "ai"): Promise<PendingEntry> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  const entry: PendingEntry = {
    id: `pend_${nanoid(8)}`,
    changes,
    proposedBy,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  page.pendingChanges = page.pendingChanges || [];
  page.pendingChanges.push(entry);
  await saveSite(site);
  return entry;
}

async function listPending(siteId: string, pageId: string): Promise<PendingEntry[]> {
  const page = await getPage(siteId, pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  return (page.pendingChanges || []).filter((c) => c.status === "pending");
}

async function dequeuePending(siteId: string, pageId: string, pendingId: string, status: "approved" | "rejected"): Promise<PendingEntry> {
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found: ${siteId}`);
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  const entry = (page.pendingChanges || []).find((c) => c.id === pendingId);
  if (!entry) throw new Error(`Pending change not found: ${pendingId}`);
  entry.status = status;
  await saveSite(site);
  return entry;
}

const OWNERS_FILE = () => path.join(DATA_DIR, "_owners.json");

async function readOwners(): Promise<OwnerAccount[]> {
  try {
    const raw = await fs.readFile(OWNERS_FILE(), "utf8");
    return (JSON.parse(raw) as { owners: OwnerAccount[] }).owners || [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}
async function writeOwners(owners: OwnerAccount[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(OWNERS_FILE(), JSON.stringify({ owners }, null, 2));
}

async function createOwner(input: { email: string; passwordHash: string; name?: string }): Promise<OwnerAccount> {
  const owners = await readOwners();
  const email = input.email.trim().toLowerCase();
  if (owners.some((o) => o.email === email)) throw new Error(`Owner already exists: ${email}`);
  const owner: OwnerAccount = {
    id: `owner_${nanoid(8)}`,
    email,
    passwordHash: input.passwordHash,
    name: input.name,
    createdAt: new Date().toISOString(),
  };
  owners.push(owner);
  await writeOwners(owners);
  return owner;
}

async function getOwnerByEmail(email: string): Promise<OwnerAccount | null> {
  const owners = await readOwners();
  return owners.find((o) => o.email === email.trim().toLowerCase()) || null;
}

async function listOwners(): Promise<{ id: string; email: string; name?: string; createdAt: string }[]> {
  const owners = await readOwners();
  return owners.map(({ id, email, name, createdAt }) => ({ id, email, name, createdAt }));
}

export const fileStore: CmsStore = {
  createSite, getSite, listSites, addPage, getPage, commitContent, rollback,
  setSiteAuth, setTheme, queueChanges, listPending, dequeuePending,
  createOwner, getOwnerByEmail, listOwners,
};
