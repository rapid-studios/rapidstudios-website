"use client";
// app/studio/page.tsx
// Owner console: login -> manage sites -> ingest -> edit/approve/publish.

import { useCallback, useEffect, useState } from "react";
import { cms, type DesignStyleKitView, type DesignTemplateView, type SiteSummary } from "./_lib/cms-client";
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
  const [designTemplates, setDesignTemplates] = useState<DesignTemplateView[]>([]);
  const [designStyleKits, setDesignStyleKits] = useState<DesignStyleKitView[]>([]);
  const [newPageTemplateId, setNewPageTemplateId] = useState("agency-proof");
  const [newPageStyleKitId, setNewPageStyleKitId] = useState("dark-cinematic");
  const [newPageRoute, setNewPageRoute] = useState("/");
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
    const library = await cms.listDesignLibrary(token);
    if (library.ok) {
      setDesignTemplates(library.data.templates);
      setDesignStyleKits(library.data.styleKits);
    }
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
        const loadedPages = res.data.pages.map((p) => ({ id: p.id, route: p.route }));
        setPages(loadedPages);
        setNewPageRoute(loadedPages.length === 0 ? "/" : "/new-page");
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
    setPages([]);
    setNotice("Loading site...");
    await loadSite(id);
    setNotice("");
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

  async function createTemplatePage() {
    if (token === null || !siteId) return;
    setNotice("Creating a guided page draft...");
    const res = await cms.createPageFromTemplate(token, siteId, {
      templateId: newPageTemplateId,
      styleKitId: newPageStyleKitId,
      route: newPageRoute.trim() || "/",
    });
    if (res.ok && res.data.pageId) {
      setNotice(
        res.data.themeApplied
          ? "Page draft created with the selected site style. Replace the clearly marked placeholders, then review it."
          : "Page draft created using this site's existing visual style. Replace the clearly marked placeholders, then review it."
      );
      await loadSite(siteId);
      setPageId(res.data.pageId);
    } else {
      setNotice(`Could not create page: ${res.data.error ?? "error"}`);
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
              <label className="mb-3 block text-sm text-white/90">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="mb-3 block text-sm text-white/90">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doLogin()}
                />
              </label>
            </>
          ) : (
            <label className="mb-3 block text-sm text-white/90">
              Master key
              <input
                type="password"
                className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
              />
            </label>
          )}
          {loginError && <p role="alert" className="mb-3 text-sm text-rose-300">{loginError}</p>}
          <button onClick={doLogin} className="min-h-11 w-full rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)]">
            Sign in
          </button>
          <button
            onClick={() => setLoginMode(loginMode === "account" ? "masterKey" : "account")}
            className="mt-3 w-full text-center text-xs text-[var(--color-text-secondary)] hover:text-white"
          >
            {loginMode === "account" ? "Use master key instead" : "Use email and password instead"}
          </button>
          <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
            Client editor at <code className="text-[var(--color-text-secondary)]">/studio/client</code>
          </p>
        </div>
      </main>
    );
  }

  // --- Console ---
  return (
    <main className="min-h-screen overflow-x-clip px-4 py-6 text-white">
      <div className="mx-auto min-w-0 max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold">Rapid Studios — CMS</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Owner console</p>
          </div>
          <button onClick={logout} className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-white/5">
            Sign out
          </button>
        </header>

        {notice && <div role="status" aria-live="polite" className="mb-4 rounded-lg bg-[var(--color-focus-ring)] px-3 py-2 text-sm text-[var(--color-text-primary)]">{notice}</div>}

        <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_1fr]">
          {/* Sidebar: sites */}
          <aside className="min-w-0 space-y-4">
            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <h2 className="mb-3 text-sm font-semibold">Sites</h2>
              <div className="mb-3 space-y-1">
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickSite(s.id)}
                    aria-pressed={siteId === s.id}
                    className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                      siteId === s.id ? "bg-[var(--color-focus-ring)] text-white" : "text-[var(--color-text-secondary)] hover:bg-white/5"
                    }`}
                  >
                    <span className="min-w-0 truncate">{s.name}</span>
                    <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{s.pages} {s.pages === 1 ? "page" : "pages"}</span>
                  </button>
                ))}
                {sites.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">No sites yet.</p>}
              </div>
              <div className="flex gap-2">
                <label className="min-w-0 flex-1 text-xs text-white/90">
                  New site name
                  <input
                    className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
                    placeholder="Acme Studio"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                  />
                </label>
                <button onClick={createSite} className="min-h-11 self-end rounded-lg bg-[var(--color-brand-primary)] px-3 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)]">
                  Create
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
                  <label className="block text-xs text-white/90">
                    Client password
                    <input
                      type="password"
                      className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-2 text-sm text-white"
                      value={clientPw}
                      onChange={(e) => setClientPw(e.target.value)}
                    />
                  </label>
                  <button onClick={setClientPassword} className="min-h-11 w-full rounded-lg border border-[var(--color-line-strong)] px-2 py-2 text-sm text-white/80 hover:bg-white/5">
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
                  <label className="block text-xs text-white/90">
                    Teammate email
                    <input
                      type="email"
                      className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
                      placeholder="teammate@rapidstudios.dev"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                    />
                  </label>
                  <label className="block text-xs text-white/90">
                    Temporary password (10+ characters)
                    <input
                      type="password"
                      className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-2 py-2 text-sm text-white"
                      value={newOwnerPw}
                      onChange={(e) => setNewOwnerPw(e.target.value)}
                    />
                  </label>
                  <button onClick={addOwner} className="min-h-11 w-full rounded-lg border border-[var(--color-line-strong)] px-2 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-white/5">
                  Add owner account
                </button>
              </div>
            </section>
          </aside>

          {/* Main: ingest + pages + editor */}
          <div className="min-w-0 space-y-4">
            {siteId ? (
              <>
                <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
                  <h2 className="text-sm font-semibold">Add a page</h2>
                  <p className="mb-4 mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Start with a guided, accessible draft. You can also import an existing page below.
                  </p>
                  <div className={`grid gap-3 ${pages.length === 0 ? "sm:grid-cols-2" : ""}`}>
                    <label className="text-xs font-medium text-white/90">
                      Page goal
                      <select
                        className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-[#0b1017] px-3 py-2 text-sm text-white"
                        value={newPageTemplateId}
                        onChange={(event) => setNewPageTemplateId(event.target.value)}
                      >
                        {designTemplates.map((template) => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </label>
                    {pages.length === 0 ? (
                      <label className="text-xs font-medium text-white/90">
                        Site visual direction
                        <select
                          className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-[#0b1017] px-3 py-2 text-sm text-white"
                          value={newPageStyleKitId}
                          onChange={(event) => setNewPageStyleKitId(event.target.value)}
                        >
                          {designStyleKits.map((kit) => (
                            <option key={kit.id} value={kit.id}>{kit.name}</option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <p className="self-end rounded-lg bg-black/20 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                        This new page will use the site&apos;s existing visual style, so other pages will not change unexpectedly.
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="min-w-0 flex-1 text-xs font-medium text-white/90">
                      Page address
                      <input
                        className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
                        placeholder="/"
                        value={newPageRoute}
                        onChange={(event) => setNewPageRoute(event.target.value)}
                      />
                    </label>
                    <button
                      onClick={createTemplatePage}
                      disabled={designTemplates.length === 0 || designStyleKits.length === 0}
                      className="min-h-11 self-end rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40"
                    >
                      Create guided draft
                    </button>
                  </div>
                  <p className="mt-3 rounded-lg bg-black/20 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {designTemplates.find((template) => template.id === newPageTemplateId)?.description ?? "Choose a page goal."}
                  </p>
                  <details className="mt-3 text-xs text-[var(--color-text-secondary)]">
                    <summary className="min-h-11 cursor-pointer py-3 text-white/75">Import an existing webpage instead</summary>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
                        placeholder="https://example.com"
                        value={ingestUrl}
                        onChange={(event) => setIngestUrl(event.target.value)}
                      />
                      <input
                        aria-label="Imported page route"
                        className="min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)] sm:w-28"
                        placeholder="/route"
                        value={ingestRoute}
                        onChange={(event) => setIngestRoute(event.target.value)}
                      />
                      <button onClick={doIngest} className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium text-white hover:bg-white/5">
                        Import
                      </button>
                    </div>
                  </details>
                  {pages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pages.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPageId(p.id)}
                          aria-current={pageId === p.id ? "page" : undefined}
                          className={`min-h-11 rounded-md px-3 py-2 text-xs ${
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
                  <Editor key={`${siteId}:${pageId}`} token={token} siteId={siteId} pageId={pageId} role="owner" />
                ) : (
                  <p className="rounded-xl border border-dashed border-[var(--color-line-subtle)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
                    Create a guided draft or import a page to start editing.
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
