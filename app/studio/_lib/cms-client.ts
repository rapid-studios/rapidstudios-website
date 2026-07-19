// app/studio/_lib/cms-client.ts
// Typed browser-side helpers for talking to /api/cms. Every call carries the
// bearer token. Underscore-prefixed folder => private, not a route.
"use client";

export interface SiteSummary {
  id: string;
  name: string;
  domain: string | null;
  pages: number;
}

export interface Slot {
  type: "text" | "button" | "link" | "image";
  value: string;
  constraints?: Record<string, unknown>;
}
export type ContentMap = Record<string, Slot>;

export interface PageView {
  id: string;
  route: string;
  versions: { id: string; createdAt: string }[];
  contentMap: ContentMap;
}

export interface PendingEntry {
  id: string;
  changes: { slotId: string; newValue: unknown }[];
  proposedBy: "client" | "ai";
  status: string;
  createdAt: string;
}

export interface DesignTemplateView {
  id: string;
  name: string;
  bestFor: string;
  description: string;
  primaryConversion: string;
  sections: { type: string; objective: string; required: boolean }[];
  recommendedStyleKitIds: string[];
  promptStarters: string[];
  sourceUrls: string[];
}

export interface DesignStyleKitView {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  avoid: string[];
  promptStarters: string[];
  tokens: Record<string, string>;
}

export interface CmsJobView {
  id: string;
  kind: "content" | "theme" | "publish";
  status: "queued" | "leased" | "completed" | "failed" | "cancelled" | "applying" | "applied" | "apply_failed";
  siteId?: string;
  pageId?: string;
  result?: Record<string, unknown>;
  error?: { code?: string; message?: string };
  applyOutcome?: { status: "applied" | "failed"; snapshotId?: string; code?: string; message?: string };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

async function call<T>(path: string, token: string | null, init?: RequestInit): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    const res = await fetch(path, { ...init, headers: { ...headers, ...(init?.headers as Record<string, string>) } });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = res.ok ? {} : { error: "The server returned an unreadable response." };
    }
    return { ok: res.ok, status: res.status, data: data as T };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Could not reach Rapid Studios. Check your connection and try again." } as T,
    };
  }
}

export const cms = {
  ownerLogin: (masterKey: string) =>
    call<{ token?: string; error?: string }>("/api/cms/auth/owner", null, {
      method: "POST",
      body: JSON.stringify({ masterKey }),
    }),

  ownerLoginEmail: (email: string, password: string) =>
    call<{ token?: string; error?: string }>("/api/cms/auth/owner", null, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => call<{ authenticated: boolean; role?: "owner" | "client"; siteId?: string }>("/api/cms/auth/me", null),

  logout: () => call<{ ok: boolean }>("/api/cms/auth/logout", null, { method: "POST" }),

  listOwners: (token: string) =>
    call<{ owners: { id: string; email: string; name?: string; createdAt: string }[] }>("/api/cms/auth/owners", token),

  createOwner: (token: string, body: { email: string; password: string; name?: string }) =>
    call<{ ok?: boolean; email?: string; error?: string }>("/api/cms/auth/owners", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  clientLogin: (siteId: string, password: string) =>
    call<{ token?: string; siteId?: string; error?: string }>("/api/cms/auth/client", null, {
      method: "POST",
      body: JSON.stringify({ siteId, password }),
    }),

  listSites: (token: string) => call<SiteSummary[]>("/api/cms/sites", token),

  createSite: (token: string, body: { name?: string; domain?: string; requiresApproval?: boolean }) =>
    call<{ id: string }>("/api/cms/sites", token, { method: "POST", body: JSON.stringify(body) }),

  getSite: (token: string, siteId: string) =>
    call<{ id: string; name: string; domain: string | null; requiresApproval: boolean; hasClientPassword: boolean; pages: { id: string; route: string }[]; error?: string }>(
      `/api/cms/sites/${siteId}`,
      token
    ),

  setSiteAuth: (token: string, siteId: string, body: { clientPassword?: string; requiresApproval?: boolean }) =>
    call<{ ok: boolean; requiresApproval: boolean; hasClientPassword: boolean }>(
      `/api/cms/sites/${siteId}/auth`,
      token,
      { method: "POST", body: JSON.stringify(body) }
    ),

  ingestUrl: (token: string, siteId: string, url: string, route?: string) =>
    call<{ pageId?: string; slotCount?: number; mode?: string; error?: string }>(
      `/api/cms/sites/${siteId}/ingest`,
      token,
      { method: "POST", body: JSON.stringify({ url, route }) }
    ),

  ingestHtml: (token: string, siteId: string, html: string, route?: string) =>
    call<{ pageId?: string; slotCount?: number; mode?: string; error?: string }>(
      `/api/cms/sites/${siteId}/ingest-html`,
      token,
      { method: "POST", body: JSON.stringify({ html, route }) }
    ),

  createPageFromTemplate: (
    token: string,
    siteId: string,
    body: { templateId: string; styleKitId: string; route?: string }
  ) =>
    call<{ pageId?: string; route?: string; slotCount?: number; draft?: boolean; themeApplied?: boolean; error?: string }>(
      `/api/cms/sites/${siteId}/pages/from-template`,
      token,
      { method: "POST", body: JSON.stringify(body) }
    ),

  getPage: (token: string, siteId: string, pageId: string) =>
    call<PageView>(`/api/cms/sites/${siteId}/pages/${pageId}`, token),

  postChanges: (
    token: string,
    siteId: string,
    pageId: string,
    changes: { slotId: string; newValue: unknown }[],
    dryRun = false
  ) =>
    call<{ accepted: boolean; queued?: boolean; snapshotId?: string; pendingId?: string; reason?: string }>(
      `/api/cms/sites/${siteId}/pages/${pageId}/changes`,
      token,
      { method: "POST", body: JSON.stringify({ changes, dryRun }) }
    ),

  postAi: (token: string, siteId: string, pageId: string, instruction: string, apply: boolean) =>
    call<{
      provider: string;
      proposed?: { slotId: string; newValue: unknown }[];
      changes?: { slotId: string; newValue: unknown }[];
      accepted: boolean;
      applied?: boolean;
      queued?: boolean;
      jobId?: string;
      workerOnline?: boolean;
      status?: string;
      snapshotId?: string;
      pendingId?: string;
      reason?: string;
    }>(`/api/cms/sites/${siteId}/pages/${pageId}/ai`, token, {
      method: "POST",
      body: JSON.stringify({ instruction, apply }),
    }),

  rollback: (token: string, siteId: string, pageId: string, snapshotId: string) =>
    call<{ ok: boolean; error?: string }>(`/api/cms/sites/${siteId}/pages/${pageId}/rollback`, token, {
      method: "POST",
      body: JSON.stringify({ snapshotId }),
    }),

  listPending: (token: string, siteId: string, pageId: string) =>
    call<{ pending: PendingEntry[] }>(`/api/cms/sites/${siteId}/pages/${pageId}/pending`, token),

  approve: (token: string, siteId: string, pageId: string, pendingId: string) =>
    call<{ approved: boolean; snapshotId?: string; reason?: string }>(
      `/api/cms/sites/${siteId}/pages/${pageId}/pending/${pendingId}/approve`,
      token,
      { method: "POST" }
    ),

  reject: (token: string, siteId: string, pageId: string, pendingId: string) =>
    call<{ rejected: boolean }>(
      `/api/cms/sites/${siteId}/pages/${pageId}/pending/${pendingId}/reject`,
      token,
      { method: "POST" }
    ),

  publish: (token: string, siteId: string, pageId: string) =>
    call<{ published?: boolean; queued?: boolean; jobId?: string; workerOnline?: boolean; status?: string; dryRun?: boolean; url?: string | null; bytes?: number; error?: string }>(
      `/api/cms/sites/${siteId}/pages/${pageId}/publish`,
      token,
      { method: "POST" }
    ),

  // --- Design lane (Phase A) ---
  listPresets: (token: string) =>
    call<{ presets: { id: string; name: string; description: string; tokens: Record<string, string> }[] }>(
      "/api/cms/design/presets",
      token
    ),

  listDesignLibrary: (token: string) =>
    call<{
      templates: DesignTemplateView[];
      styleKits: DesignStyleKitView[];
      guardrails: Record<string, unknown>;
    }>("/api/cms/design/templates", token),

  getTheme: (token: string, siteId: string) =>
    call<{ theme: Record<string, string> | null }>(`/api/cms/sites/${siteId}/theme`, token),

  setTheme: (token: string, siteId: string, body: { presetId?: string; patch?: Record<string, string> }) =>
    call<{ accepted: boolean; theme?: Record<string, string>; reason?: string; error?: string }>(
      `/api/cms/sites/${siteId}/theme`,
      token,
      { method: "PUT", body: JSON.stringify(body) }
    ),

  clearTheme: (token: string, siteId: string) =>
    call<{ accepted: boolean }>(`/api/cms/sites/${siteId}/theme`, token, { method: "DELETE" }),

  aiTheme: (
    token: string,
    siteId: string,
    instruction: string,
    apply: boolean,
    selection?: { templateId?: string; styleKitId?: string }
  ) =>
    call<{ provider?: string; presetId?: string; proposed?: Record<string, string>; accepted?: boolean; applied?: boolean; queued?: boolean; jobId?: string; workerOnline?: boolean; reason?: string; error?: string }>(
      `/api/cms/sites/${siteId}/theme/ai`,
      token,
      { method: "POST", body: JSON.stringify({ instruction, apply, ...selection }) }
    ),

  getJob: (token: string, jobId: string) =>
    call<CmsJobView>(`/api/cms/jobs/${jobId}`, token),

  applyJob: (token: string, jobId: string) =>
    call<{ applied?: boolean; alreadyApplied?: boolean; job?: CmsJobView; error?: string }>(`/api/cms/jobs/${jobId}/apply`, token, { method: "POST" }),

  cancelJob: (token: string, jobId: string) =>
    call<CmsJobView>(`/api/cms/jobs/${jobId}/cancel`, token, { method: "POST" }),

  listSiteJobs: (token: string, siteId: string) =>
    call<CmsJobView[]>(`/api/cms/jobs?siteId=${encodeURIComponent(siteId)}`, token),

  workerHealth: (token: string) =>
    call<{
      workers: { workerId: string; online: boolean; lastSeenAt: string; capabilities: string[]; status: string; message?: string }[];
    }>("/api/cms/workers/health", token),

  // Fetch edit-preview HTML for injection into a sandboxed iframe srcdoc.
  editPreviewHtml: async (token: string, siteId: string, pageId: string, channelNonce: string): Promise<string> => {
    const headers: Record<string, string> = { "x-cms-editor-channel": channelNonce };
    if (token) headers.authorization = `Bearer ${token}`;
    try {
      const res = await fetch(`/api/cms/sites/${siteId}/pages/${pageId}/edit-preview`, {
        headers,
        cache: "no-store",
      });
      if (!res.ok) return `<p style="font-family:system-ui;padding:16px">Preview unavailable (${res.status}).</p>`;
      return res.text();
    } catch {
      return '<p style="font-family:system-ui;padding:16px">Preview unavailable. Check your connection and try again.</p>';
    }
  },
};
