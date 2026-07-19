"use client";
// app/studio/client/page.tsx
// Client editor: a non-technical client logs in with their site id + password
// and edits only their own site. Changes go through the Guardian and, if the
// site requires approval, queue for the owner.

import { useCallback, useEffect, useState } from "react";
import { cms } from "../_lib/cms-client";
import { Editor } from "../_components/Editor";

export default function ClientEditorPage() {
  const [token, setToken] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [pages, setPages] = useState<{ id: string; route: string }[]>([]);

  const [siteInput, setSiteInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Restore an httpOnly-cookie session; tokens are never persisted client-side.
    cms.me().then((res) => {
      if (res.ok && res.data.authenticated && res.data.role === "client" && res.data.siteId) {
        setToken("");
        setSiteId(res.data.siteId);
      }
    });
  }, []);

  const bootstrapPages = useCallback(
    async (tok: string, sid: string) => {
      const site = await cms.getSite(tok, sid);
      if (!site.ok) {
        setError(site.data.error ?? "Your pages could not be loaded. Try signing in again.");
        return;
      }
      const availablePages = site.data.pages;
      setPages(availablePages);
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const m = hash.match(/pageId=([a-zA-Z0-9_]+)/);
      const requested = m ? availablePages.find((page) => page.id === m[1]) : null;
      setPageId(requested?.id ?? availablePages[0]?.id ?? null);
      setError(availablePages.length === 0 ? "This site does not have an editable page yet." : "");
    },
    []
  );

  useEffect(() => {
    // bootstrapPages fetches before updating state; it is not a synchronous state cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token !== null && siteId) bootstrapPages(token, siteId);
  }, [token, siteId, bootstrapPages]);

  async function doLogin() {
    setError("");
    const res = await cms.clientLogin(siteInput.trim(), password);
    if (res.ok && res.data.token) {
      setToken(res.data.token);
      setSiteId(siteInput.trim());
      setPassword("");
    } else {
      setError(res.data.error ?? "Login failed");
    }
  }

  async function logout() {
    await cms.logout();
    setToken(null);
    setSiteId(null);
    setPageId(null);
  }

  if (token === null || !siteId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] shadow-[var(--shadow-soft)] p-6">
          <h1 className="font-display mb-1 text-lg font-semibold text-white">Edit your site</h1>
          <p className="mb-5 text-sm text-[var(--color-text-secondary)]">Sign in with the site id and password your studio gave you.</p>
          <label className="mb-3 block text-sm text-white/90">
            Site ID
            <input
              className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
              placeholder="For example: site_abc123"
              value={siteInput}
              onChange={(e) => setSiteInput(e.target.value)}
            />
          </label>
          <label className="mb-3 block text-sm text-white/90">
            Password
            <input
              type="password"
              className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          </label>
          {error && <p role="alert" className="mb-3 text-sm text-rose-300">{error}</p>}
          <button onClick={doLogin} className="min-h-11 w-full rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-canvas-end)] hover:bg-[var(--color-brand-primary-hover)]">
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold">Edit your site</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Changes are checked automatically before they go live.</p>
          </div>
          <button onClick={logout} className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-white/5">
            Sign out
          </button>
        </header>

        {pages.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setPageId(p.id)}
                aria-current={pageId === p.id ? "page" : undefined}
                className={`min-h-11 rounded-md px-3 py-2 text-xs ${pageId === p.id ? "bg-[var(--color-focus-ring)]" : "bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10"}`}
              >
                {p.route}
              </button>
            ))}
          </div>
        )}

        {pageId ? (
          <Editor key={`${siteId}:${pageId}`} token={token} siteId={siteId} pageId={pageId} role="client" />
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--color-line-subtle)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
            {error || "Loading your page…"}
          </p>
        )}
      </div>
    </main>
  );
}
