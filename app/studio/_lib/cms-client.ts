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

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

async function call<T>(path: string, token: string | null, init?: RequestInit): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers: { ...headers, ...(init?.headers as Record<string, string>) } });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data: data as T };
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
    call<{ id: string; name: string; domain: string | null; requiresApproval: boolean; clientPasswordHash?: string | null; pages: { id: string; route: string }[] }>(
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
    call<{ published: boolean; dryRun: boolean; url: string | null; bytes: number; error?: string }>(
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

  aiTheme: (token: string, siteId: string, instruction: string, apply: boolean) =>
    call<{ provider: string; presetId?: string; proposed?: Record<string, string>; accepted: boolean; applied?: boolean; reason?: string; error?: string }>(
      `/api/cms/sites/${siteId}/theme/ai`,
      token,
      { method: "POST", body: JSON.stringify({ instruction, apply }) }
    ),

  // Fetch edit-preview HTML for injection into a sandboxed iframe srcdoc.
  editPreviewHtml: async (token: string, siteId: string, pageId: string, channelNonce: string): Promise<string> => {
    const headers: Record<string, string> = { "x-cms-editor-channel": channelNonce };
    if (token) headers.authorization = `Bearer ${token}`;
    const res = await fetch(`/api/cms/sites/${siteId}/pages/${pageId}/edit-preview`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return `<p style="font-family:system-ui;padding:16px">Preview unavailable (${res.status}).</p>`;
    return res.text();
  },
};
