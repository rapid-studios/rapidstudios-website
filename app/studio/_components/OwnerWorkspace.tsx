"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  FilePlus2,
  FileText,
  Globe2,
  LogOut,
  Plus,
  Settings2,
  Users2,
} from "lucide-react";
import type { DesignStyleKitView, DesignTemplateView, SiteSummary } from "../_lib/cms-client";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Editor } from "./Editor";
import styles from "../studio.module.css";

type PageSummary = { id: string; route: string };

type OwnerWorkspaceProps = {
  token: string;
  sites: SiteSummary[];
  siteId: string | null;
  pageId: string | null;
  pages: PageSummary[];
  requiresApproval: boolean;
  owners: { id: string; email: string }[];
  notice: string;
  newSiteName: string;
  newPageTemplateId: string;
  newPageStyleKitId: string;
  newPageRoute: string;
  designTemplates: DesignTemplateView[];
  designStyleKits: DesignStyleKitView[];
  ingestUrl: string;
  ingestRoute: string;
  clientPw: string;
  newOwnerEmail: string;
  newOwnerPw: string;
  setPageId: Dispatch<SetStateAction<string | null>>;
  setNewSiteName: Dispatch<SetStateAction<string>>;
  setNewPageTemplateId: Dispatch<SetStateAction<string>>;
  setNewPageStyleKitId: Dispatch<SetStateAction<string>>;
  setNewPageRoute: Dispatch<SetStateAction<string>>;
  setIngestUrl: Dispatch<SetStateAction<string>>;
  setIngestRoute: Dispatch<SetStateAction<string>>;
  setClientPw: Dispatch<SetStateAction<string>>;
  setNewOwnerEmail: Dispatch<SetStateAction<string>>;
  setNewOwnerPw: Dispatch<SetStateAction<string>>;
  pickSite: (id: string) => Promise<void>;
  createSite: () => Promise<void>;
  createTemplatePage: () => Promise<void>;
  doIngest: () => Promise<void>;
  toggleApproval: () => Promise<void>;
  setClientPassword: () => Promise<void>;
  addOwner: () => Promise<void>;
  logout: () => Promise<void>;
};

export function OwnerWorkspace({
  token,
  sites,
  siteId,
  pageId,
  pages,
  requiresApproval,
  owners,
  notice,
  newSiteName,
  newPageTemplateId,
  newPageStyleKitId,
  newPageRoute,
  designTemplates,
  designStyleKits,
  ingestUrl,
  ingestRoute,
  clientPw,
  newOwnerEmail,
  newOwnerPw,
  setPageId,
  setNewSiteName,
  setNewPageTemplateId,
  setNewPageStyleKitId,
  setNewPageRoute,
  setIngestUrl,
  setIngestRoute,
  setClientPw,
  setNewOwnerEmail,
  setNewOwnerPw,
  pickSite,
  createSite,
  createTemplatePage,
  doIngest,
  toggleApproval,
  setClientPassword,
  addOwner,
  logout,
}: OwnerWorkspaceProps) {
  const selectedSite = sites.find((site) => site.id === siteId) ?? null;
  const selectedPage = pages.find((page) => page.id === pageId) ?? null;

  return (
    <main className={styles.studioRoot}>
      <div className={styles.studioShell}>
        <header className={styles.topbar}>
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#438eff] text-[#06101d]">
              <BrandIcon size={19} title="Rapid Studios" />
            </span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-white">Rapid Studios</h1>
                <span className="hidden text-xs text-[#6f87a7] sm:inline">/ Studio</span>
              </div>
              <p className="truncate text-xs text-[#93a9c5]">
                {selectedSite ? `${selectedSite.name}${selectedPage ? ` · ${selectedPage.route}` : ""}` : "Choose a site to begin"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={selectedPage?.route ?? "/"}
              target="_blank"
              rel="noreferrer"
              className={`${styles.secondaryButton} hidden items-center gap-2 px-3 text-xs sm:inline-flex`}
            >
              View site <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button onClick={logout} className={`${styles.secondaryButton} inline-flex items-center gap-2 px-3 text-xs`}>
              <LogOut size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {notice && (
          <div role="status" aria-live="polite" className="border-b border-[#24364d] bg-[#10243e] px-4 py-2.5 text-sm text-[#d9e8ff]">
            {notice}
          </div>
        )}

        <div className={styles.workspace}>
          <aside className={styles.rail} aria-label="Site and page navigation">
            <div className={`${styles.railScroll} space-y-5`}>
              <section>
                <div className="mb-2 flex min-h-11 items-center justify-between gap-2 px-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f87a7]">Sites</h2>
                  <details className="group">
                    <summary aria-label="Create a site" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-lg text-[#93a9c5] hover:bg-white/5 hover:text-white [&::-webkit-details-marker]:hidden">
                      <Plus size={17} aria-hidden="true" />
                    </summary>
                    <div className={`${styles.panel} mt-1 w-full p-3`}>
                      <label className="block text-xs font-medium text-[#c7d6ea]">
                        New site name
                        <input
                          className={`${styles.input} mt-1 px-3 py-2 text-sm`}
                          placeholder="Acme Studio"
                          value={newSiteName}
                          onChange={(event) => setNewSiteName(event.target.value)}
                        />
                      </label>
                      <button onClick={createSite} className={`${styles.primaryButton} mt-2 w-full px-3 text-sm`}>
                        Create site
                      </button>
                    </div>
                  </details>
                </div>
                <div className="space-y-1">
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => pickSite(site.id)}
                      aria-pressed={siteId === site.id}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                        siteId === site.id ? "bg-[#18345a] text-white" : "text-[#93a9c5] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Globe2 size={16} className="shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{site.name}</span>
                      <span className="shrink-0 text-[11px] text-[#6f87a7]">{site.pages}</span>
                    </button>
                  ))}
                  {sites.length === 0 && <p className="px-3 py-2 text-xs leading-relaxed text-[#6f87a7]">No sites yet. Use + to create one.</p>}
                </div>
              </section>

              {siteId && (
                <section>
                  <div className="mb-2 flex min-h-11 items-center justify-between gap-2 px-2">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f87a7]">Pages</h2>
                    <FilePlus2 size={16} className="text-[#6f87a7]" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => setPageId(page.id)}
                        aria-current={pageId === page.id ? "page" : undefined}
                        className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                          pageId === page.id ? "bg-[#438eff] font-medium text-[#06101d]" : "text-[#93a9c5] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <FileText size={16} className="shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{page.route === "/" ? "Homepage" : page.route}</span>
                      </button>
                    ))}
                  </div>

                  <details className="group mt-2">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-xs font-medium text-[#93a9c5] hover:bg-white/5 hover:text-white [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2"><Plus size={15} aria-hidden="true" /> Add page</span>
                      <ChevronDown size={15} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="mt-2 space-y-3 border-l border-[#24364d] pl-3">
                      <label className="block text-xs font-medium text-[#c7d6ea]">
                        Page goal
                        <select className={`${styles.input} mt-1 px-2 text-xs`} value={newPageTemplateId} onChange={(event) => setNewPageTemplateId(event.target.value)}>
                          {designTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                        </select>
                      </label>
                      {pages.length === 0 && (
                        <label className="block text-xs font-medium text-[#c7d6ea]">
                          Visual direction
                          <select className={`${styles.input} mt-1 px-2 text-xs`} value={newPageStyleKitId} onChange={(event) => setNewPageStyleKitId(event.target.value)}>
                            {designStyleKits.map((kit) => <option key={kit.id} value={kit.id}>{kit.name}</option>)}
                          </select>
                        </label>
                      )}
                      <label className="block text-xs font-medium text-[#c7d6ea]">
                        Page address
                        <input className={`${styles.input} mt-1 px-3 text-sm`} value={newPageRoute} onChange={(event) => setNewPageRoute(event.target.value)} placeholder="/services" />
                      </label>
                      <button onClick={createTemplatePage} disabled={designTemplates.length === 0 || designStyleKits.length === 0} className={`${styles.primaryButton} w-full px-3 text-xs disabled:opacity-40`}>
                        Create guided draft
                      </button>
                    </div>
                  </details>
                </section>
              )}

              <details className="group border-t border-[#1a2a3f] pt-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-sm text-[#93a9c5] hover:bg-white/5 hover:text-white [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2"><Settings2 size={16} aria-hidden="true" /> Settings &amp; advanced</span>
                  <ChevronDown size={15} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-2 space-y-5 border-l border-[#24364d] pl-3">
                  {siteId && (
                    <section>
                      <h3 className="mb-2 text-xs font-semibold text-white">Site access</h3>
                      <label className="flex min-h-11 items-center gap-2 text-xs text-[#93a9c5]">
                        <input type="checkbox" checked={requiresApproval} onChange={toggleApproval} />
                        Review changes before they apply
                      </label>
                      <label className="mt-2 block text-xs font-medium text-[#c7d6ea]">
                        Client password
                        <input type="password" className={`${styles.input} mt-1 px-3 text-sm`} value={clientPw} onChange={(event) => setClientPw(event.target.value)} />
                      </label>
                      <button onClick={setClientPassword} className={`${styles.secondaryButton} mt-2 w-full px-3 text-xs`}>Save password</button>
                      <p className="mt-2 break-all text-[10px] text-[#6f87a7]">Site ID: {siteId}</p>
                    </section>
                  )}

                  {siteId && (
                    <section>
                      <h3 className="mb-2 text-xs font-semibold text-white">Import an existing page</h3>
                      <input className={`${styles.input} mb-2 px-3 text-xs`} placeholder="https://example.com" value={ingestUrl} onChange={(event) => setIngestUrl(event.target.value)} />
                      <input aria-label="Imported page route" className={`${styles.input} mb-2 px-3 text-xs`} placeholder="/route" value={ingestRoute} onChange={(event) => setIngestRoute(event.target.value)} />
                      <button onClick={doIngest} className={`${styles.secondaryButton} w-full px-3 text-xs`}>Import page</button>
                    </section>
                  )}

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-white"><Users2 size={15} aria-hidden="true" /> Team</h3>
                    <div className="mb-2 space-y-1">
                      {owners.map((owner) => <p key={owner.id} className="truncate text-[11px] text-[#93a9c5]">{owner.email}</p>)}
                      {owners.length === 0 && <p className="text-[11px] text-[#6f87a7]">Master key only.</p>}
                    </div>
                    <input type="email" aria-label="Teammate email" className={`${styles.input} mb-2 px-3 text-xs`} placeholder="teammate@rapidstudios.dev" value={newOwnerEmail} onChange={(event) => setNewOwnerEmail(event.target.value)} />
                    <input type="password" aria-label="Temporary password" className={`${styles.input} mb-2 px-3 text-xs`} placeholder="Temporary password (10+ characters)" value={newOwnerPw} onChange={(event) => setNewOwnerPw(event.target.value)} />
                    <button onClick={addOwner} className={`${styles.secondaryButton} w-full px-3 text-xs`}>Add teammate</button>
                  </section>
                </div>
              </details>
            </div>
          </aside>

          {siteId && pageId ? (
            <Editor key={`${siteId}:${pageId}`} token={token} siteId={siteId} pageId={pageId} role="owner" />
          ) : (
            <section className="grid min-h-[65vh] place-items-center bg-[#07111f] px-6 py-16 text-center">
              <div className="max-w-sm">
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-[#24364d] bg-[#0f1d30] text-[#438eff]">
                  {siteId ? <FilePlus2 size={22} aria-hidden="true" /> : <Globe2 size={22} aria-hidden="true" />}
                </span>
                <h2 className="text-base font-semibold text-white">{siteId ? "Create your first page" : "Choose a site"}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#93a9c5]">
                  {siteId ? "Use Add page in the left rail to start with a guided draft." : "Select a site from the left rail, or use + to create one."}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
