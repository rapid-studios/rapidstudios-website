"use client";

import { useCallback, useEffect, useState } from "react";
import { OwnerWorkspace } from "./_components/OwnerWorkspace";
import { cms, type DesignStyleKitView, type DesignTemplateView, type SiteSummary } from "./_lib/cms-client";

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
    const ownerResult = await cms.listOwners(token);
    if (ownerResult.ok) setOwners(ownerResult.data.owners.map(({ id, email: ownerEmail }) => ({ id, email: ownerEmail })));
  }, [token]);

  useEffect(() => {
    // loadSites fetches before updating state; it is not a synchronous state cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSites();
  }, [loadSites]);

  const loadSite = useCallback(async (id: string) => {
    if (token === null) return;
    const res = await cms.getSite(token, id);
    if (res.ok) {
      const loadedPages = res.data.pages.map((page) => ({ id: page.id, route: page.route }));
      setPages(loadedPages);
      setNewPageRoute(loadedPages.length === 0 ? "/" : "/new-page");
      setRequiresApproval(res.data.requiresApproval);
      setPageId(res.data.pages[0]?.id ?? null);
    }
  }, [token]);

  async function doLogin() {
    setLoginError("");
    const res = loginMode === "masterKey"
      ? await cms.ownerLogin(masterKey)
      : await cms.ownerLoginEmail(email.trim(), password);
    if (res.ok && res.data.token !== undefined) {
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
    if (token === null || !newOwnerEmail.trim() || !newOwnerPw) return;
    const res = await cms.createOwner(token, { email: newOwnerEmail.trim(), password: newOwnerPw });
    if (res.ok) {
      setNewOwnerEmail("");
      setNewOwnerPw("");
      setNotice(`Owner account created: ${res.data.email}`);
      const ownerResult = await cms.listOwners(token);
      if (ownerResult.ok) setOwners(ownerResult.data.owners.map(({ id, email: ownerEmail }) => ({ id, email: ownerEmail })));
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
    setNotice("Loading site…");
    await loadSite(id);
    setNotice("");
  }

  async function doIngest() {
    if (token === null || !siteId || !ingestUrl.trim()) return;
    setNotice("Importing page…");
    const res = await cms.ingestUrl(token, siteId, ingestUrl.trim(), ingestRoute.trim() || "/");
    if (res.ok && res.data.pageId) {
      setNotice(`Imported ${res.data.slotCount} editable fields.`);
      setIngestUrl("");
      await loadSite(siteId);
      setPageId(res.data.pageId);
    } else {
      setNotice(`Import failed: ${res.data.error ?? "error"}`);
    }
  }

  async function createTemplatePage() {
    if (token === null || !siteId) return;
    setNotice("Creating a guided page draft…");
    const res = await cms.createPageFromTemplate(token, siteId, {
      templateId: newPageTemplateId,
      styleKitId: newPageStyleKitId,
      route: newPageRoute.trim() || "/",
    });
    if (res.ok && res.data.pageId) {
      setNotice(res.data.themeApplied
        ? "Page draft created with the selected site style. Replace the clearly marked placeholders, then review it."
        : "Page draft created using this site's existing visual style. Replace the clearly marked placeholders, then review it.");
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
      setNotice("Client password saved.");
    }
  }

  async function toggleApproval() {
    if (token === null || !siteId) return;
    const res = await cms.setSiteAuth(token, siteId, { requiresApproval: !requiresApproval });
    if (res.ok) setRequiresApproval(res.data.requiresApproval);
  }

  if (token === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-6 shadow-[var(--shadow-soft)]">
          <h1 className="font-display mb-1 text-lg font-semibold text-white">Rapid Studios — CMS</h1>
          <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
            {loginMode === "account" ? "Owner console. Sign in with your account." : "Owner console. Sign in with the master key."}
          </p>
          {loginMode === "account" ? (
            <>
              <label className="mb-3 block text-sm text-white/90">
                Email
                <input type="email" autoComplete="email" className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="mb-3 block text-sm text-white/90">
                Password
                <input type="password" autoComplete="current-password" className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && doLogin()} />
              </label>
            </>
          ) : (
            <label className="mb-3 block text-sm text-white/90">
              Master key
              <input type="password" className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white" value={masterKey} onChange={(event) => setMasterKey(event.target.value)} onKeyDown={(event) => event.key === "Enter" && doLogin()} />
            </label>
          )}
          {loginError && <p role="alert" className="mb-3 text-sm text-rose-300">{loginError}</p>}
          <button onClick={doLogin} className="min-h-11 w-full rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)]">Sign in</button>
          <button onClick={() => setLoginMode(loginMode === "account" ? "masterKey" : "account")} className="mt-3 min-h-11 w-full text-center text-xs text-[var(--color-text-secondary)] hover:text-white">
            {loginMode === "account" ? "Use master key instead" : "Use email and password instead"}
          </button>
          <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">Client editor at <code>/studio/client</code></p>
        </div>
      </main>
    );
  }

  return (
    <OwnerWorkspace
      token={token}
      sites={sites}
      siteId={siteId}
      pageId={pageId}
      pages={pages}
      requiresApproval={requiresApproval}
      owners={owners}
      notice={notice}
      newSiteName={newSiteName}
      newPageTemplateId={newPageTemplateId}
      newPageStyleKitId={newPageStyleKitId}
      newPageRoute={newPageRoute}
      designTemplates={designTemplates}
      designStyleKits={designStyleKits}
      ingestUrl={ingestUrl}
      ingestRoute={ingestRoute}
      clientPw={clientPw}
      newOwnerEmail={newOwnerEmail}
      newOwnerPw={newOwnerPw}
      setPageId={setPageId}
      setNewSiteName={setNewSiteName}
      setNewPageTemplateId={setNewPageTemplateId}
      setNewPageStyleKitId={setNewPageStyleKitId}
      setNewPageRoute={setNewPageRoute}
      setIngestUrl={setIngestUrl}
      setIngestRoute={setIngestRoute}
      setClientPw={setClientPw}
      setNewOwnerEmail={setNewOwnerEmail}
      setNewOwnerPw={setNewOwnerPw}
      pickSite={pickSite}
      createSite={createSite}
      createTemplatePage={createTemplatePage}
      doIngest={doIngest}
      toggleApproval={toggleApproval}
      setClientPassword={setClientPassword}
      addOwner={addOwner}
      logout={logout}
    />
  );
}
