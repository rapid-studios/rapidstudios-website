"use client";
// app/studio/page.tsx
// Owner console: login -> manage sites -> ingest -> edit/approve/publish.

import { useCallback, useEffect, useState } from "react";
import { cms, type SiteSummary } from "./_lib/cms-client";
import { Editor } from "./_components/Editor";

export default function StudioPage() {
  const [token, setToken] = useState<string | null>(null);
  const [masterKey, setMasterKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"account" | "masterKey">("account");
  const [loginError, setLoginError] = useState("");
  const [owners, setOwners] = useState<{ id: string; email: string }[]>([]);
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerPw, setNewOwnerPw] = useState("");

  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [pages, setPages] = useState<{ id: string; route: string }[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(true);

  const [newSiteName, setNewSiteName] = useState("");
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingestRoute, setIngestRoute] = useState("/");
  const [clientPw, setClientPw] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // Restore an existing httpOnly-cookie session; the token itself is never
    // persisted in the browser.
    cms.me().then((res) => {
      if (res.ok && res.data.authenticated && res.data.role === "owner") setToken("");
    });
  }, []);

  const loadSites = useCallback(async () => {
    if (token === null) return;
    const res = await cms.listSites(token);
    if (res.status === 403) {
      setToken(null);
      return;
    }
    if (res.ok) setSites(res.data);
    const o = await cms.listOwners(token);
    if (o.ok) setOwners(o.data.owners.map(({ id, email }) => ({ id, email })));
  }, [token]);

  useEffect(() => {
    // loadSites fetches before updating state; it is not a synchronous state cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSites();
  }, [loadSites]);

  const loadSite = useCallback(
    async (id: string) => {
      if (token === null) return;
      const res = await cms.getSite(token, id);
      if (res.ok) {
        setPages(res.data.pages.map((p) => ({ id: p.id, route: p.route })));
        setRequiresApproval(res.data.requiresApproval);
        setPageId(res.data.pages[0]?.id ?? null);
      }
    },
    [token]
  );

  async function doLogin() {
    setLoginError("");
    const res =
      loginMode === "masterKey"
        ? await cms.ownerLogin(masterKey)
        : await cms.ownerLoginEmail(email.trim(), password);
    if (res.ok && res.data.token !== undefined) {
      // The httpOnly cookie is set by the server; keep the token only in
      // memory for this tab's session.
      setToken(res.data.token ?? "");
      setMasterKey("");
      setPassword("");
    } else {
      setLoginError(res.data.error ?? "Login failed");
    }
  }

  async function logout() {
    await cms.logout();
    setToken(null);
    setSiteId(null);
    setPageId(null);
  }

  async function addOwner() {
    if (token === null) return;
    if (!newOwnerEmail.trim() || !newOwnerPw) return;
    const res = await cms.createOwner(token, { email: newOwnerEmail.trim(), password: newOwnerPw });
    if (res.ok) {
      setNewOwnerEmail("");
      setNewOwnerPw("");
      setNotice(`Owner account created: ${res.data.email}`);
      const o = await cms.listOwners(token);
      if (o.ok) setOwners(o.data.owners.map(({ id, email }) => ({ id, email })));
    } else {
      setNotice(`Could not create owner: ${res.data.error ?? "error"}`);
    }
  }

  async function createSite() {
    if (token === null || !newSiteName.trim()) return;
    const res = await cms.createSite(token, { name: newSiteName.trim(), requiresApproval: true });
    if (res.ok) {
      setNewSiteName("");
      await loadSites();
      setSiteId(res.data.id);
      await loadSite(res.data.id);
    }
  }

  async function pickSite(id: string) {
    setSiteId(id);
    setPageId(null);
    await loadSite(id);
  }

  async function doIngest() {
    if (token === null || !siteId || !ingestUrl.trim()) return;
    setNotice("Ingesting…");
    const res = await cms.ingestUrl(token, siteId, ingestUrl.trim(), ingestRoute.trim() || "/");
    if (res.ok && res.data.pageId) {
      setNotice(`Ingested ${res.data.slotCount} slots (mode: ${res.data.mode}).`);
      setIngestUrl("");
      await loadSite(siteId);
      setPageId(res.data.pageId);
    } else {
      setNotice(`Ingest failed: ${res.data.error ?? "error"}`);
    }
  }

  async function setClientPassword() {
    if (token === null || !siteId || !clientPw) return;
    const res = await cms.setSiteAuth(token, siteId, { clientPassword: clientPw });
    if (res.ok) {
      setClientPw("");
      setNotice("Client password set. Share the site id + password for the client editor.");
    }
  }

  async function toggleApproval() {
    if (token === null || !siteId) return;
    const next = !requiresApproval;
    const res = await cms.setSiteAuth(token, siteId, { requiresApproval: next });
    if (res.ok) setRequiresApproval(res.data.requiresApproval);
  }

  // --- Login screen ---
  if (token === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] shadow-[var(--shadow-soft)] p-6">
          <h1 className="font-display mb-1 text-lg font-semibold text-white">Rapid Studios — CMS</h1>
          <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
            {loginMode === "account" ? "Owner console. Sign in with your account." : "Owner console. Sign in with the master key."}
          </p>
          {loginMode === "account" ? (
            <>
              <input
                type="email"
                className="mb-3 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="mb-3 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
              />
            </>
          ) : (
            <input
              type="password"
              className="mb-3 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
              placeholder="Master key"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          )}
          {loginError && <p className="mb-3 text-sm text-rose-300">{loginError}</p>}
          <button onClick={doLogin} className="w-full rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)]">
            Sign in
          </button>
          <button
            onClick={() => setLoginMode(loginMode === "account" ? "masterKey" : "account")}
            className="mt-3 w-full text-center text-xs text-[var(--color-text-secondary)] hover:text-white"
          >
            {loginMode === "account" ? "Use master key instead" : "Use email and password instead"}
          </button>
          <p className="mt-4 text-center text-xs text-white/30">
            Client editor at <code className="text-[var(--color-text-secondary)]">/studio/client</code>
          </p>
        </div>
      </main>
    );
  }

  // --- Console ---
  return (
    <main className="min-h-screen px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold">Rapid Studios — CMS</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Owner console</p>
          </div>
          <button onClick={logout} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-white/5">
            Sign out
          </button>
        </header>

        {notice && <div className="mb-4 rounded-lg bg-[var(--color-focus-ring)] px-3 py-2 text-sm text-[var(--color-text-primary)]">{notice}</div>}

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Sidebar: sites */}
          <aside className="space-y-4">
            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <h2 className="mb-3 text-sm font-semibold">Sites</h2>
              <div className="mb-3 space-y-1">
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickSite(s.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                      siteId === s.id ? "bg-[var(--color-focus-ring)] text-white" : "text-[var(--color-text-secondary)] hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{s.pages}p</span>
                  </button>
                ))}
                {sites.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">No sites yet.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                  placeholder="New site name"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                />
                <button onClick={createSite} className="rounded-lg bg-[var(--color-brand-primary)] px-3 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)]">
                  +
                </button>
              </div>
            </section>

            {siteId && (
              <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
                <h2 className="mb-3 text-sm font-semibold">Site settings</h2>
                <label className="mb-3 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <input type="checkbox" checked={requiresApproval} onChange={toggleApproval} />
                  Require approval (managed tier)
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    className="w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                    placeholder="Set client password"
                    value={clientPw}
                    onChange={(e) => setClientPw(e.target.value)}
                  />
                  <button onClick={setClientPassword} className="w-full rounded-lg border border-[var(--color-line-strong)] px-2 py-1.5 text-sm text-white/80 hover:bg-white/5">
                    Save client password
                  </button>
                </div>
                <p className="mt-2 break-all text-xs text-[var(--color-text-secondary)]">site id: {siteId}</p>
              </section>
            )}

            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <h2 className="mb-3 text-sm font-semibold">Team</h2>
              <div className="mb-3 space-y-1">
                {owners.map((o) => (
                  <p key={o.id} className="truncate text-xs text-[var(--color-text-secondary)]">{o.email}</p>
                ))}
                {owners.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">No owner accounts yet. Master key only.</p>}
              </div>
              <div className="space-y-2">
                <input
                  type="email"
                  className="w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                  placeholder="teammate@rapidstudios.dev"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                  placeholder="Password (10+ chars)"
                  value={newOwnerPw}
                  onChange={(e) => setNewOwnerPw(e.target.value)}
                />
                <button onClick={addOwner} className="w-full rounded-lg border border-[var(--color-line-strong)] px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-white/5">
                  Add owner account
                </button>
              </div>
            </section>
          </aside>

          {/* Main: ingest + pages + editor */}
          <div className="space-y-4">
            {siteId ? (
              <>
                <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
                  <h2 className="mb-3 text-sm font-semibold">Ingest a page</h2>
                  <div className="flex flex-wrap gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                      placeholder="https://example.com"
                      value={ingestUrl}
                      onChange={(e) => setIngestUrl(e.target.value)}
                    />
                    <input
                      className="w-28 rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                      placeholder="/route"
                      value={ingestRoute}
                      onChange={(e) => setIngestRoute(e.target.value)}
                    />
                    <button onClick={doIngest} className="rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)]">
                      Ingest
                    </button>
                  </div>
                  {pages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pages.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPageId(p.id)}
                          className={`rounded-md px-2 py-1 text-xs ${
                            pageId === p.id ? "bg-[var(--color-focus-ring)] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {p.route}
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {pageId ? (
                  <Editor token={token} siteId={siteId} pageId={pageId} role="owner" />
                ) : (
                  <p className="rounded-xl border border-dashed border-[var(--color-line-subtle)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
                    Ingest a page to start editing.
                  </p>
                )}
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-line-subtle)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
                Select or create a site to begin.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
