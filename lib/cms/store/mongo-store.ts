// lib/cms/store/mongo-store.ts
// MongoDB-backed store implementing CmsStore. One document per site in a
// `sites` collection, pages embedded, immutable snapshots in page.versions[].
// Commit + snapshot is a single atomic update. Use this in production / on
// Vercel (the filesystem store can't persist on serverless).

import { MongoClient, type Collection } from "mongodb";
import { nanoid } from "./id";
import type { CmsStore, Site, Page, ContentMap, Snapshot, PendingEntry, ProposedChange, SiteSummary, OwnerAccount } from "../types";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "rapidstudios_cms";
const COLLECTION = process.env.MONGODB_COLLECTION || "sites";
const OWNERS_COLLECTION = process.env.MONGODB_OWNERS_COLLECTION || "cms_owners";

// Cache the client across hot reloads / serverless invocations.
const globalForMongo = globalThis as unknown as {
  __cmsMongo?: Promise<Collection<Site>>;
  __cmsMongoOwners?: Promise<Collection<OwnerAccount>>;
  __cmsMongoClient?: MongoClient;
};

async function client(): Promise<MongoClient> {
  if (globalForMongo.__cmsMongoClient) return globalForMongo.__cmsMongoClient;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  const c = new MongoClient(MONGODB_URI, { ignoreUndefined: true });
  await c.connect();
  globalForMongo.__cmsMongoClient = c;
  return c;
}

function coll(): Promise<Collection<Site>> {
  if (globalForMongo.__cmsMongo) return globalForMongo.__cmsMongo;
  globalForMongo.__cmsMongo = (async () => {
    const c = (await client()).db(DB_NAME).collection<Site>(COLLECTION);
    await c.createIndex({ id: 1 }, { unique: true });
    await c.createIndex({ "pages.id": 1 });
    return c;
  })();
  return globalForMongo.__cmsMongo;
}

function ownersColl(): Promise<Collection<OwnerAccount>> {
  if (globalForMongo.__cmsMongoOwners) return globalForMongo.__cmsMongoOwners;
  globalForMongo.__cmsMongoOwners = (async () => {
    const c = (await client()).db(DB_NAME).collection<OwnerAccount>(OWNERS_COLLECTION);
    await c.createIndex({ email: 1 }, { unique: true });
    return c;
  })();
  return globalForMongo.__cmsMongoOwners;
}

async function createOwner(input: { email: string; passwordHash: string; name?: string }): Promise<OwnerAccount> {
  const c = await ownersColl();
  const owner: OwnerAccount = {
    id: `owner_${nanoid(8)}`,
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    name: input.name,
    createdAt: new Date().toISOString(),
  };
  await c.insertOne({ ...owner });
  return owner;
}

async function getOwnerByEmail(email: string): Promise<OwnerAccount | null> {
  const c = await ownersColl();
  const doc = await c.findOne({ email: email.trim().toLowerCase() });
  if (!doc) return null;
  const owner = { ...doc } as OwnerAccount & { _id?: unknown };
  delete owner._id;
  return owner as OwnerAccount;
}

async function listOwners(): Promise<{ id: string; email: string; name?: string; createdAt: string }[]> {
  const c = await ownersColl();
  const docs = await c.find({}, { projection: { _id: 0, id: 1, email: 1, name: 1, createdAt: 1 } }).toArray();
  return docs as { id: string; email: string; name?: string; createdAt: string }[];
}

function clean(doc: (Site & { _id?: unknown }) | null): Site | null {
  if (!doc) return null;
  const copy = { ...doc } as Site & { _id?: unknown };
  delete copy._id;
  return copy as Site;
}

async function createSite(input: { name?: string; domain?: string; requiresApproval?: boolean }): Promise<Site> {
  const c = await coll();
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
  await c.insertOne({ ...site });
  return site;
}

async function getSite(siteId: string): Promise<Site | null> {
  const c = await coll();
  const doc = await c.findOne({ id: siteId });
  return clean(doc as (Site & { _id?: unknown }) | null);
}

async function listSites(): Promise<SiteSummary[]> {
  const c = await coll();
  const docs = await c.find({}, { projection: { _id: 0, id: 1, name: 1, domain: 1, pages: 1 } }).toArray();
  return docs.map((s) => ({ id: s.id, name: s.name, domain: s.domain, pages: (s.pages || []).length }));
}

async function addPage(siteId: string, input: { route?: string; template: string; contentMap: ContentMap }): Promise<Page> {
  const c = await coll();
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
  const result = await c.updateOne({ id: siteId }, { $push: { pages: page } });
  if (result.matchedCount === 0) throw new Error(`Site not found: ${siteId}`);
  return page;
}

async function getPage(siteId: string, pageId: string): Promise<Page | null> {
  const site = await getSite(siteId);
  if (!site) return null;
  return site.pages.find((p) => p.id === pageId) || null;
}

async function commitContent(siteId: string, pageId: string, nextContentMap: ContentMap): Promise<{ page: Page; snapshot: Snapshot }> {
  const c = await coll();
  const snapshot: Snapshot = {
    id: `snap_${nanoid(8)}`,
    createdAt: new Date().toISOString(),
    contentMap: structuredClone(nextContentMap),
    publishedDeploymentUrl: null,
  };
  const result = await c.updateOne(
    { id: siteId, "pages.id": pageId },
    {
      $set: { "pages.$.contentMap": nextContentMap },
      $push: { "pages.$.versions": snapshot },
    }
  );
  if (result.matchedCount === 0) throw new Error(`Page not found: ${pageId}`);
  const page = await getPage(siteId, pageId);
  if (!page) throw new Error(`Page not found after commit: ${pageId}`);
  return { page, snapshot };
}

async function rollback(siteId: string, pageId: string, snapshotId: string): Promise<Page> {
  const page = await getPage(siteId, pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  const snap = (page.versions || []).find((v) => v.id === snapshotId);
  if (!snap) throw new Error(`Snapshot not found: ${snapshotId}`);
  const c = await coll();
  const result = await c.updateOne(
    { id: siteId, "pages.id": pageId },
    { $set: { "pages.$.contentMap": structuredClone(snap.contentMap) } }
  );
  if (result.matchedCount === 0) throw new Error(`Page not found: ${pageId}`);
  const updated = await getPage(siteId, pageId);
  if (!updated) throw new Error(`Page not found after rollback: ${pageId}`);
  return updated;
}

async function setSiteAuth(siteId: string, patch: { clientPasswordHash?: string | null; requiresApproval?: boolean }): Promise<Site> {
  const c = await coll();
  const $set: Record<string, unknown> = {};
  if (patch.clientPasswordHash !== undefined) $set.clientPasswordHash = patch.clientPasswordHash;
  if (patch.requiresApproval !== undefined) $set.requiresApproval = patch.requiresApproval;
  const result = await c.updateOne({ id: siteId }, { $set });
  if (result.matchedCount === 0) throw new Error(`Site not found: ${siteId}`);
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found after update: ${siteId}`);
  return site;
}

async function setTheme(siteId: string, theme: import("../design/tokens").ThemeTokens | null): Promise<Site> {
  const c = await coll();
  const result = await c.updateOne({ id: siteId }, { $set: { theme } });
  if (result.matchedCount === 0) throw new Error(`Site not found: ${siteId}`);
  const site = await getSite(siteId);
  if (!site) throw new Error(`Site not found after update: ${siteId}`);
  return site;
}

async function queueChanges(siteId: string, pageId: string, changes: ProposedChange[], proposedBy: "client" | "ai"): Promise<PendingEntry> {
  const c = await coll();
  const entry: PendingEntry = {
    id: `pend_${nanoid(8)}`,
    changes,
    proposedBy,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const result = await c.updateOne(
    { id: siteId, "pages.id": pageId },
    { $push: { "pages.$.pendingChanges": entry } }
  );
  if (result.matchedCount === 0) throw new Error(`Page not found: ${pageId}`);
  return entry;
}

async function listPending(siteId: string, pageId: string): Promise<PendingEntry[]> {
  const page = await getPage(siteId, pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  return (page.pendingChanges || []).filter((c) => c.status === "pending");
}

async function dequeuePending(siteId: string, pageId: string, pendingId: string, status: "approved" | "rejected"): Promise<PendingEntry> {
  const page = await getPage(siteId, pageId);
  if (!page) throw new Error(`Page not found: ${pageId}`);
  const entry = (page.pendingChanges || []).find((c) => c.id === pendingId);
  if (!entry) throw new Error(`Pending change not found: ${pendingId}`);
  const c = await coll();
  await c.updateOne(
    { id: siteId },
    { $set: { "pages.$[p].pendingChanges.$[c].status": status } },
    { arrayFilters: [{ "p.id": pageId }, { "c.id": pendingId }] }
  );
  entry.status = status;
  return entry;
}

export const mongoStore: CmsStore = {
  createSite, getSite, listSites, addPage, getPage, commitContent, rollback,
  setSiteAuth, setTheme, queueChanges, listPending, dequeuePending,
  createOwner, getOwnerByEmail, listOwners,
};
