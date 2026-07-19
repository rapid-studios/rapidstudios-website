// lib/cms/types.ts
// Shared types for the AI-native CMS core.

export type SlotType = "text" | "button" | "link" | "image";

export interface SlotConstraints {
  maxLength?: number;
  required?: boolean;
  allowHtml?: boolean;
  schemes?: string[];
}

export interface Slot {
  type: SlotType;
  value: string;
  constraints: SlotConstraints;
  alt?: string;
  href?: string;
}

export type ContentMap = Record<string, Slot>;

export interface Snapshot {
  id: string;
  createdAt: string;
  contentMap: ContentMap;
  publishedDeploymentUrl: string | null;
}

export interface ProposedChange {
  slotId: string;
  newValue: unknown;
}

export interface PendingEntry {
  id: string;
  changes: ProposedChange[];
  proposedBy: "client" | "ai";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Page {
  id: string;
  route: string;
  template: string;
  contentMap: ContentMap;
  versions: Snapshot[];
  pendingChanges: PendingEntry[];
}

export interface Site {
  id: string;
  name: string;
  domain: string | null;
  requiresApproval: boolean;
  clientPasswordHash?: string | null;
  /** Design-lane theme tokens (validated by the Design Guardian). Null = untouched original design. */
  theme?: import("./design/tokens").ThemeTokens | null;
  pages: Page[];
  createdAt: string;
}

export interface OwnerAccount {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
}

export interface SiteSummary {
  id: string;
  name: string;
  domain: string | null;
  pages: number;
}

// Guardian verdicts
export type ChangeResult =
  | { accepted: true; slotId: string; value: string }
  | { accepted: false; slotId: string | null; reason: string };

export type BatchVerdict =
  | { accepted: true; contentMap: ContentMap; results: ChangeResult[] }
  | { accepted: false; reason: string; results: ChangeResult[] };

// Store interface — both file and mongo adapters implement this.
export interface CmsStore {
  createSite(input: { name?: string; domain?: string; requiresApproval?: boolean }): Promise<Site>;
  getSite(siteId: string): Promise<Site | null>;
  listSites(): Promise<SiteSummary[]>;
  addPage(siteId: string, input: { route?: string; template: string; contentMap: ContentMap }): Promise<Page>;
  getPage(siteId: string, pageId: string): Promise<Page | null>;
  commitContent(siteId: string, pageId: string, nextContentMap: ContentMap): Promise<{ page: Page; snapshot: Snapshot }>;
  rollback(siteId: string, pageId: string, snapshotId: string): Promise<Page>;
  setSiteAuth(siteId: string, patch: { clientPasswordHash?: string | null; requiresApproval?: boolean }): Promise<Site>;
  setTheme(siteId: string, theme: import("./design/tokens").ThemeTokens | null): Promise<Site>;
  createOwner(input: { email: string; passwordHash: string; name?: string }): Promise<OwnerAccount>;
  getOwnerByEmail(email: string): Promise<OwnerAccount | null>;
  listOwners(): Promise<{ id: string; email: string; name?: string; createdAt: string }[]>;
  queueChanges(siteId: string, pageId: string, changes: ProposedChange[], proposedBy: "client" | "ai"): Promise<PendingEntry>;
  listPending(siteId: string, pageId: string): Promise<PendingEntry[]>;
  dequeuePending(siteId: string, pageId: string, pendingId: string, status: "approved" | "rejected"): Promise<PendingEntry>;
  close?(): Promise<void>;
}
