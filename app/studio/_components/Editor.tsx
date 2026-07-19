"use client";
// app/studio/_components/Editor.tsx
// The editing surface, shared by the owner console and the client editor.
// - slot list with inline manual edits (through the Guardian)
// - AI chat box (proposes -> Guardian -> apply/queue)
// - live preview iframe (fetched with the token, injected via srcdoc)
// - owner-only: version history + rollback, approval queue, publish

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  FileText,
  Monitor,
  Palette,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  cms,
  type CmsJobView,
  type ContentMap,
  type DesignStyleKitView,
  type DesignTemplateView,
  type PageView,
  type PendingEntry,
} from "../_lib/cms-client";
import styles from "../studio.module.css";

type Verdict = { kind: "ok" | "bad"; text: string } | null;

function createEditorChannelNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function Editor({
  token,
  siteId,
  pageId,
  role,
}: {
  token: string;
  siteId: string;
  pageId: string;
  role: "owner" | "client";
}) {
  const [page, setPage] = useState<PageView | null>(null);
  const [pending, setPending] = useState<PendingEntry[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [slotId, setSlotId] = useState("");
  const [value, setValue] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [presets, setPresets] = useState<{ id: string; name: string; description: string }[]>([]);
  const [activeTheme, setActiveTheme] = useState<Record<string, string> | null>(null);
  const [designBrief, setDesignBrief] = useState("");
  const [templates, setTemplates] = useState<DesignTemplateView[]>([]);
  const [styleKits, setStyleKits] = useState<DesignStyleKitView[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("agency-proof");
  const [selectedStyleKitId, setSelectedStyleKitId] = useState("dark-cinematic");
  const [workerOnline, setWorkerOnline] = useState<boolean | null>(null);
  const [activeJob, setActiveJob] = useState<CmsJobView | null>(null);
  const [dismissedJobId, setDismissedJobId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"content" | "look">("content");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [channelNonce] = useState(createEditorChannelNonce);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const advancedEditorRef = useRef<HTMLDetailsElement | null>(null);
  const contentPanelButtonRef = useRef<HTMLButtonElement | null>(null);
  const lookPanelButtonRef = useRef<HTMLButtonElement | null>(null);

  const contentMap: ContentMap = page?.contentMap ?? {};

  function showContentPanel() {
    setActivePanel("content");
    window.requestAnimationFrame(() => contentPanelButtonRef.current?.focus());
  }

  function showLookPanel() {
    setActivePanel("look");
    window.requestAnimationFrame(() => lookPanelButtonRef.current?.focus());
  }

  const refreshPreview = useCallback(async () => {
    const html = await cms.editPreviewHtml(token, siteId, pageId, channelNonce);
    if (iframeRef.current) iframeRef.current.srcdoc = html;
  }, [token, siteId, pageId, channelNonce]);

  const loadPage = useCallback(async () => {
    const res = await cms.getPage(token, siteId, pageId);
    if (res.ok) setPage(res.data);
    if (role === "owner") {
      const p = await cms.listPending(token, siteId, pageId);
      if (p.ok) setPending(p.data.pending || []);
      const pr = await cms.listPresets(token);
      if (pr.ok) setPresets(pr.data.presets.map(({ id, name, description }) => ({ id, name, description })));
      const library = await cms.listDesignLibrary(token);
      if (library.ok) {
        setTemplates(library.data.templates);
        setStyleKits(library.data.styleKits);
      }
      const health = await cms.workerHealth(token);
      if (health.ok) setWorkerOnline(health.data.workers.some((worker) => worker.online));
      const jobs = await cms.listSiteJobs(token, siteId);
      if (jobs.ok) {
        const relevant = jobs.data.find(
          (job) => job.pageId === pageId || (job.kind === "theme" && role === "owner")
        );
        if (relevant && relevant.id !== dismissedJobId) setActiveJob((current) => current ?? relevant);
      }
      const th = await cms.getTheme(token, siteId);
      if (th.ok) setActiveTheme(th.data.theme);
    }
  }, [token, siteId, pageId, role, dismissedJobId]);

  async function applyPreset(presetId: string) {
    setBusy(true);
    const res = await cms.setTheme(token, siteId, { presetId });
    setBusy(false);
    if (res.ok && res.data.accepted) {
      setActiveTheme(res.data.theme ?? null);
      setVerdict({ kind: "ok", text: `Design system applied: ${presetId}` });
      await refreshPreview();
    } else {
      setVerdict({ kind: "bad", text: `Design rejected: ${res.data.reason ?? res.data.error ?? "error"}` });
    }
  }

  async function runDesignAi() {
    const template = templates.find((item) => item.id === selectedTemplateId);
    const styleKit = styleKits.find((item) => item.id === selectedStyleKitId);
    const instruction =
      designBrief.trim() ||
      template?.promptStarters[0] ||
      styleKit?.promptStarters[0] ||
      "Improve clarity and hierarchy while preserving verified content.";
    setBusy(true);
    const res = await cms.aiTheme(token, siteId, instruction, false, {
      templateId: selectedTemplateId,
      styleKitId: selectedStyleKitId,
    });
    setBusy(false);
    if (res.ok && res.data.jobId) {
      setActivePanel("content");
      setActiveJob({
        id: res.data.jobId,
        kind: "theme",
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setWorkerOnline(res.data.workerOnline ?? workerOnline);
      setVerdict({ kind: "ok", text: "Design proposal queued. You can keep working while Codex prepares it." });
    } else if (res.ok && res.data.accepted) {
      setVerdict({ kind: "ok", text: `Proposal ready [${res.data.provider}]${res.data.presetId ? ` via ${res.data.presetId}` : ""}` });
      const th = await cms.getTheme(token, siteId);
      if (th.ok) setActiveTheme(th.data.theme);
      await refreshPreview();
    } else {
      setVerdict({ kind: "bad", text: `Restyle rejected: ${res.data.reason ?? res.data.error ?? "no applicable change"}` });
    }
  }

  async function resetTheme() {
    if (!window.confirm("Restore the site's original visual style? You can create a new proposal afterward.")) return;
    setBusy(true);
    const res = await cms.clearTheme(token, siteId);
    setBusy(false);
    if (res.ok) {
      setActiveTheme(null);
      setVerdict({ kind: "ok", text: "Original design restored." });
      await refreshPreview();
    }
  }

  useEffect(() => {
    // These callbacks fetch first and only update React state after awaiting the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage();
    refreshPreview();
  }, [loadPage, refreshPreview]);

  useEffect(() => {
    if (!activeJob || ["completed", "failed", "cancelled", "applied", "apply_failed"].includes(activeJob.status)) return;
    let stopped = false;
    const poll = async () => {
      const response = await cms.getJob(token, activeJob.id);
      if (stopped || !response.ok) return;
      setActiveJob(response.data);
      if (response.data.status === "completed") {
        const result = response.data.result ?? {};
        const summary = typeof result.summary === "string" ? result.summary : "Proposal ready for review.";
        setVerdict({ kind: "ok", text: summary });
      } else if (response.data.status === "failed") {
        setVerdict({ kind: "bad", text: response.data.error?.message ?? "The local worker could not finish this job." });
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 2500);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [activeJob, token, siteId, loadPage, refreshPreview]);

  async function applyActiveJob() {
    if (!activeJob) return;
    setBusy(true);
    const response = await cms.applyJob(token, activeJob.id);
    setBusy(false);
    if (!response.ok || !response.data.job) {
      setVerdict({ kind: "bad", text: response.data.error ?? "This proposal could not be applied." });
      return;
    }
    setActiveJob(response.data.job);
    setVerdict({
      kind: "ok",
      text:
        activeJob.kind === "content"
          ? "Copy approved and applied. A new content rollback point was saved."
          : "Site design approved and applied.",
    });
    await loadPage();
    const theme = await cms.getTheme(token, siteId);
    if (theme.ok) setActiveTheme(theme.data.theme);
    await refreshPreview();
  }

  async function cancelActiveJob() {
    if (!activeJob) return;
    const response = await cms.cancelJob(token, activeJob.id);
    if (response.ok) {
      setActiveJob(response.data);
      setVerdict({ kind: "ok", text: "Job cancelled." });
    }
  }

  // Receive click-to-edit commits from the preview overlay.
  useEffect(() => {
    const onMessage = async (ev: MessageEvent) => {
      if (ev.source !== iframeRef.current?.contentWindow) return;
      const m = ev.data as { __cms?: boolean; channelNonce?: string; slotId?: string; newValue?: unknown; selectOnly?: boolean } | null;
      if (
        !m ||
        m.__cms !== true ||
        m.channelNonce !== channelNonce ||
        typeof m.slotId !== "string" ||
        !/^[a-z]+_[0-9a-f]{10}$/.test(m.slotId) ||
        typeof m.newValue !== "string"
      ) return;
      if (m.selectOnly) {
        setSlotId(m.slotId);
        setValue(m.newValue);
        if (advancedEditorRef.current) advancedEditorRef.current.open = true;
        setVerdict({ kind: "ok", text: "Image field selected. Paste the replacement image URL in Advanced editing." });
        return;
      }
      const res = await cms.postChanges(token, siteId, pageId, [{ slotId: m.slotId, newValue: m.newValue }]);
      if (!res.ok || res.data.accepted === false) {
        setVerdict({ kind: "bad", text: `Rejected (${m.slotId}) — ${res.data.reason ?? "error"}` });
      } else if (res.data.queued) {
        setVerdict({ kind: "ok", text: `Queued for approval (${m.slotId})` });
        await loadPage();
      } else {
        setVerdict({ kind: "ok", text: `Saved (${m.slotId}) — snapshot ${res.data.snapshotId}` });
        await loadPage();
        await refreshPreview();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token, siteId, pageId, channelNonce, loadPage, refreshPreview]);

  async function runManual(dryRun: boolean) {
    if (!slotId) return;
    setBusy(true);
    const res = await cms.postChanges(token, siteId, pageId, [{ slotId, newValue: value }], dryRun);
    setBusy(false);
    if (!res.ok || res.data.accepted === false) {
      setVerdict({ kind: "bad", text: `Rejected — ${res.data.reason ?? "error"}` });
    } else if (dryRun) {
      setVerdict({ kind: "ok", text: "Valid — would apply cleanly." });
    } else if (res.data.queued) {
      setVerdict({ kind: "ok", text: `Queued for approval (pending ${res.data.pendingId})` });
      await loadPage();
    } else {
      setVerdict({ kind: "ok", text: `Saved — snapshot ${res.data.snapshotId}` });
      await loadPage();
      await refreshPreview();
    }
  }

  async function runAi(apply: boolean) {
    if (!instruction.trim()) return;
    setBusy(true);
    const res = await cms.postAi(token, siteId, pageId, instruction.trim(), apply);
    setBusy(false);
    if (res.ok && res.data.jobId) {
      setActivePanel("content");
      setActiveJob({
        id: res.data.jobId,
        kind: "content",
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setWorkerOnline(res.data.workerOnline ?? workerOnline);
      setVerdict({ kind: "ok", text: "Copy proposal queued. Codex can use only this page's verified slots." });
      return;
    }
    const proposed = (res.data.proposed || res.data.changes || [])
      .map((c) => `${c.slotId} → "${String(c.newValue)}"`)
      .join("; ");
    if (!res.ok || res.data.accepted === false) {
      setVerdict({ kind: "bad", text: `Rejected [${res.data.provider}] — ${res.data.reason ?? "error"}${proposed ? ` (proposed: ${proposed})` : ""}` });
    } else if (res.data.queued) {
      setVerdict({ kind: "ok", text: `Queued for approval [${res.data.provider}] — ${proposed}` });
      await loadPage();
    } else {
      setVerdict({ kind: "ok", text: `${apply ? "Applied" : "Valid"} [${res.data.provider}] — ${proposed}${res.data.snapshotId ? ` · snapshot ${res.data.snapshotId}` : ""}` });
      if (apply) {
        await loadPage();
        await refreshPreview();
      }
    }
  }

  async function doRollback(snapshotId: string) {
    if (!window.confirm("Restore this earlier version? A new rollback point will be saved.")) return;
    const res = await cms.rollback(token, siteId, pageId, snapshotId);
    if (res.ok) {
      setVerdict({ kind: "ok", text: `Rolled back to ${snapshotId}` });
      await loadPage();
      await refreshPreview();
    } else {
      setVerdict({ kind: "bad", text: `Rollback failed — ${res.data.error ?? "error"}` });
    }
  }

  async function decide(p: PendingEntry, approve: boolean) {
    const res = approve
      ? await cms.approve(token, siteId, pageId, p.id)
      : await cms.reject(token, siteId, pageId, p.id);
    if (res.ok) {
      setVerdict({ kind: "ok", text: approve ? `Approved ${p.id}` : `Rejected ${p.id}` });
      await loadPage();
      await refreshPreview();
    } else {
      setVerdict({ kind: "bad", text: `Action failed for ${p.id}` });
    }
  }

  async function doPublish() {
    setActivePanel("content");
    setBusy(true);
    const res = await cms.publish(token, siteId, pageId);
    setBusy(false);
    if (res.ok && res.data.jobId) {
      setActiveJob({
        id: res.data.jobId,
        kind: "publish",
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setWorkerOnline(res.data.workerOnline ?? workerOnline);
      setVerdict({
        kind: "ok",
        text: "Publish queued. The worker will open a GitHub preview PR; production will not change until it is reviewed and merged.",
      });
      return;
    }
    if (res.ok && res.data.published) {
      setVerdict({ kind: "ok", text: `${res.data.dryRun ? "Published (dry-run)" : "Published"} — ${res.data.url} (${res.data.bytes} bytes)` });
    } else {
      setVerdict({ kind: "bad", text: `Publish failed — ${res.data.error ?? "error"}` });
    }
  }

  const slotEntries = Object.entries(contentMap);
  const canPublishManagedHomepage = siteId === "rapidstudios" && pageId === "homepage";
  const contentProposalChanges = activeJob?.kind === "content" && Array.isArray(activeJob.result?.changes)
    ? activeJob.result.changes.filter(
        (change): change is { slotId: string; newValue: unknown } =>
          Boolean(change && typeof change === "object" && typeof (change as { slotId?: unknown }).slotId === "string")
      )
    : [];
  const themeProposalEntries = activeJob?.kind === "theme" && activeJob.result?.patch && typeof activeJob.result.patch === "object"
    ? Object.entries(activeJob.result.patch as Record<string, unknown>)
    : [];
  const activeJobHasChanges = activeJob?.kind === "content"
    ? contentProposalChanges.length > 0
    : activeJob?.kind === "theme"
      ? themeProposalEntries.length > 0
      : false;
  const jobInProgress = Boolean(activeJob && ["queued", "leased", "applying"].includes(activeJob.status));

  return (
    <div className={styles.editorGrid} data-testid="studio-editor-workspace">
      <section className={styles.previewPane} aria-labelledby="live-preview-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="live-preview-title" className="text-sm font-semibold text-white">Live page preview</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                <CircleCheck size={12} aria-hidden="true" /> Live
              </span>
            </div>
            <p className="mt-1 text-xs text-[#93a9c5]">Click a field in the page, or use Tab and Enter, to edit it.</p>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Preview size">
            <button
              onClick={() => setPreviewMode("desktop")}
              aria-pressed={previewMode === "desktop"}
              className={`grid h-11 w-11 place-items-center rounded-lg ${previewMode === "desktop" ? "bg-[#18345a] text-white" : "text-[#93a9c5] hover:bg-white/5 hover:text-white"}`}
              title="Desktop preview"
            >
              <Monitor size={17} aria-hidden="true" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              aria-pressed={previewMode === "mobile"}
              className={`grid h-11 w-11 place-items-center rounded-lg ${previewMode === "mobile" ? "bg-[#18345a] text-white" : "text-[#93a9c5] hover:bg-white/5 hover:text-white"}`}
              title="Mobile preview"
            >
              <Smartphone size={17} aria-hidden="true" />
            </button>
            <button onClick={refreshPreview} className="grid h-11 w-11 place-items-center rounded-lg text-[#93a9c5] hover:bg-white/5 hover:text-white" title="Refresh preview">
              <RefreshCw size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={`${styles.previewViewport} ${previewMode === "mobile" ? styles.previewViewportMobile : ""}`} data-testid="studio-preview-frame">
          <iframe
            ref={iframeRef}
            title="Editable page preview"
            sandbox="allow-scripts"
            referrerPolicy="same-origin"
            className={styles.previewIframe}
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-[#6f87a7]">
          <ShieldCheck size={15} className="shrink-0 text-[#438eff]" aria-hidden="true" />
          Every change is checked before it can reach the live site.
        </p>
      </section>

      <aside
        className={`${styles.inspector} ${activePanel === "content" ? "" : "hidden"}`}
        aria-label="Content editing tools"
      >
        <div className={`${styles.stickyInspector} space-y-4`}>
          {role === "owner" && (
            <div className="flex min-h-11 rounded-lg bg-[#07111f] p-1" role="group" aria-label="Editing mode">
              <button
                ref={contentPanelButtonRef}
                aria-pressed={activePanel === "content"}
                onClick={showContentPanel}
                className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#18345a] px-3 text-xs font-semibold text-white"
              >
                <FileText size={15} aria-hidden="true" /> Content
              </button>
              <button
                aria-label="Look, review, and publish"
                aria-pressed={activePanel === "look"}
                onClick={showLookPanel}
                className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold text-[#93a9c5] hover:text-white"
              >
                <Palette size={15} aria-hidden="true" /> Look
              </button>
            </div>
          )}
        {verdict && (
          <div
            role={verdict.kind === "bad" ? "alert" : "status"}
            className={`rounded-lg px-3 py-2 text-sm ${
              verdict.kind === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
            }`}
          >
            {verdict.text}
          </div>
        )}

        {activeJob && (
          <section
            aria-live="polite"
            className="rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white">
                  {activeJob.kind === "publish"
                    ? "Publishing preview"
                    : activeJob.kind === "theme"
                      ? "Design proposal"
                      : "Copy proposal"}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {activeJob.status === "queued" &&
                    (workerOnline === false ? "Waiting for this computer to come online." : "Waiting for the local Codex worker.")}
                  {activeJob.status === "leased" && "Codex is working on it now."}
                  {activeJob.status === "completed" &&
                    (activeJob.kind !== "publish" && !activeJobHasChanges
                      ? "No safe changes were suggested. Review the summary, then dismiss this proposal."
                      : activeJob.kind === "publish"
                      ? "Preview PR ready."
                      : role === "owner"
                        ? "Ready for your review."
                        : "Ready for the site owner to review.")}
                  {activeJob.status === "applying" && "Applying the approved proposal."}
                  {activeJob.status === "applied" && "Approved and applied."}
                  {activeJob.status === "apply_failed" && (activeJob.applyOutcome?.message ?? "The proposal could not be applied.")}
                  {activeJob.status === "failed" && (activeJob.error?.message ?? "Needs attention.")}
                  {activeJob.status === "cancelled" && "Cancelled."}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  ["completed", "applied"].includes(activeJob.status)
                    ? "bg-emerald-500/15 text-emerald-200"
                    : ["failed", "apply_failed"].includes(activeJob.status)
                      ? "bg-rose-500/15 text-rose-200"
                      : activeJob.status === "cancelled"
                        ? "bg-white/10 text-white/60"
                      : "bg-sky-500/15 text-sky-200"
                }`}
              >
                {activeJob.status === "leased"
                  ? "Working"
                  : activeJob.status.charAt(0).toUpperCase() + activeJob.status.slice(1)}
              </span>
            </div>
            {activeJob.status === "completed" && contentProposalChanges.length > 0 && (
              <div className="mt-4 space-y-2" aria-label="Proposed copy changes">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Review each change</h4>
                {contentProposalChanges.map((change, index) => {
                  const current = contentMap[change.slotId]?.value ?? "";
                  return (
                    <div key={change.slotId} className="rounded-lg border border-[var(--color-line-subtle)] bg-black/20 p-3 text-xs">
                      <div className="mb-2 font-medium text-white">Page field {index + 1}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <div className="mb-1 text-[var(--color-text-secondary)]">Current</div>
                          <div className="break-words rounded-md bg-black/25 p-2 text-white/75">{String(current)}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-[var(--color-text-secondary)]">Proposed</div>
                          <div className="break-words rounded-md bg-emerald-500/10 p-2 text-emerald-100">{String(change.newValue)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeJob.status === "completed" && themeProposalEntries.length > 0 && (
              <div className="mt-4 space-y-2" aria-label="Proposed site design changes">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Review design tokens</h4>
                {themeProposalEntries.map(([key, proposed]) => {
                  const current = activeTheme?.[key] ?? "Default";
                  const isColor = ["bg", "surface", "text", "muted", "accent", "accentText"].includes(key);
                  return (
                    <div key={key} className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--color-line-subtle)] bg-black/20 px-3 py-2 text-xs">
                      <span className="w-24 shrink-0 font-medium text-white">{key}</span>
                      {isColor && <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded border border-white/20" style={{ backgroundColor: String(proposed) }} />}
                      <span className="min-w-0 break-all text-[var(--color-text-secondary)]">{String(current)} → <strong className="text-white">{String(proposed)}</strong></span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {activeJob.status === "completed" && activeJob.kind !== "publish" && activeJobHasChanges && role === "owner" && (
                  <button
                    onClick={applyActiveJob}
                    disabled={busy}
                    className="min-h-11 rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] disabled:opacity-40"
                  >
                    Approve and apply
                  </button>
                )}
              {["queued", "leased"].includes(activeJob.status) && (
                <button
                  onClick={cancelActiveJob}
                  className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Cancel
                </button>
              )}
              {activeJob.status === "completed" && typeof activeJob.result?.prUrl === "string" && (
                <a
                  className="inline-flex min-h-11 items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-black"
                  href={activeJob.result.prUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Review GitHub preview PR
                </a>
              )}
              {["completed", "failed", "cancelled", "applied", "apply_failed"].includes(activeJob.status) && (
                <button
                  onClick={() => {
                    setDismissedJobId(activeJob.id);
                    setActiveJob(null);
                  }}
                  className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-white/70 hover:bg-white/5"
                >
                  Dismiss
                </button>
              )}
            </div>
          </section>
        )}

        <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <h3 className="mb-1 text-sm font-semibold text-white">Describe the change you want</h3>
          <p className="mb-3 text-xs text-[var(--color-text-secondary)]">Explain how the page should read. Codex can edit only the fields already on this page.</p>
          <textarea
            className="mb-2 min-h-28 w-full resize-y rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-3 text-sm leading-5 text-white placeholder:text-[var(--color-text-secondary)]"
            placeholder='For example: "Make the headline clearer for SaaS founders"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <div>
            <button
              onClick={() => runAi(false)}
              disabled={busy || jobInProgress}
              className="min-h-11 w-full rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40"
            >
              Generate proposal
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">Codex drafts the change. You review and approve it before anything reaches the live site.</p>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Editable page content</h3>
            <span className="text-xs text-[var(--color-text-secondary)]">{slotEntries.length} editable</span>
          </div>
          <div className="max-h-64 space-y-1 overflow-auto">
            {slotEntries.map(([id, s]) => (
              <button
                key={id}
                onClick={() => {
                  setSlotId(id);
                  setValue(typeof s.value === "string" ? s.value : "");
                }}
                className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-white/5"
              >
                <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 uppercase text-[var(--color-text-secondary)]">{s.type}</span>
                <span className="truncate text-[var(--color-text-secondary)]">{String(s.value).slice(0, 70)}</span>
              </button>
            ))}
          </div>
        </section>

        <details ref={advancedEditorRef} className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-white">Advanced: edit a field by its slot ID</summary>
          <div className="mt-3 space-y-2">
            <input
              className="min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
              placeholder="slot id (or click a slot below)"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
            />
            <input
              className="min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
              placeholder="new value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => runManual(true)}
                disabled={busy}
                className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-40"
              >
                Validate
              </button>
              <button
                onClick={() => runManual(false)}
                disabled={busy}
                className="min-h-11 rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40"
              >
                {role === "client" ? "Submit" : "Apply"}
              </button>
            </div>
          </div>
        </details>
        </div>
      </aside>

      {role === "owner" && (
          <aside
            className={`${styles.inspector} ${activePanel === "look" ? "" : "hidden"}`}
            aria-label="Design and publishing tools"
          >
            <div className={`${styles.stickyInspector} space-y-4`}>
              <div className="flex min-h-11 rounded-lg bg-[#07111f] p-1" role="group" aria-label="Editing mode">
                <button
                  aria-pressed={activePanel === "content"}
                  onClick={showContentPanel}
                  className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold text-[#93a9c5] hover:text-white"
                >
                  <FileText size={15} aria-hidden="true" /> Content
                </button>
                <button
                  ref={lookPanelButtonRef}
                  aria-label="Look, review, and publish"
                  aria-pressed={activePanel === "look"}
                  onClick={showLookPanel}
                  className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#18345a] px-3 text-xs font-semibold text-white"
                >
                  <Palette size={15} aria-hidden="true" /> Look
                </button>
              </div>
            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">Change the site&apos;s design</h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Visual changes apply consistently across every page in this site.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTheme && (
                    <button onClick={resetTheme} disabled={busy || jobInProgress} className="min-h-11 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-white/5 disabled:opacity-40">
                      Restore original
                    </button>
                  )}
                  <span className="text-xs text-[var(--color-text-secondary)]">{activeTheme ? "themed" : "original"}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium text-white/90">
                    1. What should this page do?
                    <select
                      className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-[#0b1017] px-3 py-2 text-sm text-white"
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium text-white/90">
                    2. Choose a site-wide visual direction
                    <select
                      className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-line-subtle)] bg-[#0b1017] px-3 py-2 text-sm text-white"
                      value={selectedStyleKitId}
                      onChange={(event) => setSelectedStyleKitId(event.target.value)}
                    >
                      {styleKits.map((kit) => (
                        <option key={kit.id} value={kit.id}>{kit.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="rounded-lg bg-black/20 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <strong className="text-white">
                    {templates.find((item) => item.id === selectedTemplateId)?.name ?? "Page goal"}:
                  </strong>{" "}
                  {templates.find((item) => item.id === selectedTemplateId)?.description ?? "Choose a page goal to see guidance."}
                  <br />
                  <strong className="text-white">
                    {styleKits.find((item) => item.id === selectedStyleKitId)?.name ?? "Visual direction"}:
                  </strong>{" "}
                  {styleKits.find((item) => item.id === selectedStyleKitId)?.description ?? "Choose a style to see guidance."}
                </div>
                <label className="block text-xs font-medium text-white/90">
                  3. What would you like to change?{" "}
                  <span className="font-normal text-[var(--color-text-secondary)]">Optional</span>
                  <textarea
                    className="mt-1 min-h-24 w-full resize-y rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]"
                    placeholder={templates.find((item) => item.id === selectedTemplateId)?.promptStarters[0] ?? "Describe the outcome you want. The existing audience and verified content will be preserved by default."}
                    value={designBrief}
                    onChange={(event) => setDesignBrief(event.target.value)}
                  />
                </label>
                <button
                  onClick={runDesignAi}
                  disabled={busy || jobInProgress || templates.length === 0 || styleKits.length === 0}
                  className="min-h-11 w-full rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40"
                >
                  Create design proposal
                </button>
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  Codex proposes; the Guardian checks contrast, token safety, verified claims, and locked structure. Nothing publishes until you review it.
                </p>
                <details className="text-xs text-[var(--color-text-secondary)]">
                  <summary className="min-h-11 cursor-pointer py-3 text-white/75">Advanced: apply a visual preset immediately</summary>
                  <div className="flex flex-wrap gap-2 pb-1">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        disabled={busy || jobInProgress}
                        title={preset.description}
                        className="min-h-11 rounded-md bg-white/5 px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-focus-ring)] hover:text-white disabled:opacity-40"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </section>

            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-white">Pending approval</h3>
                <span className="text-xs text-[var(--color-text-secondary)]">{pending.length} waiting</span>
              </div>
              {pending.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">No pending changes.</p>
              ) : (
                <div className="space-y-2">
                  {pending.map((p) => (
                    <div key={p.id} className="rounded-lg border border-[var(--color-line-subtle)] bg-black/20 p-2">
                      <div className="mb-1 text-xs text-[var(--color-text-secondary)]">
                        {p.proposedBy} · {new Date(p.createdAt).toLocaleString()}
                      </div>
                      <div className="mb-2 text-xs text-white/80">
                        {p.changes.map((c) => `${c.slotId} → "${String(c.newValue)}"`).join("; ")}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => decide(p, true)} className="min-h-11 rounded-md bg-emerald-500/90 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-400">
                          Approve
                        </button>
                        <button onClick={() => decide(p, false)} className="min-h-11 rounded-md border border-[var(--color-line-strong)] px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-white/5">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-white">Version history</h3>
                {canPublishManagedHomepage && (
                  <button
                    onClick={doPublish}
                    disabled={busy || jobInProgress}
                    className="min-h-11 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-40"
                  >
                    Create publish preview
                  </button>
                )}
              </div>
              <div className="max-h-48 space-y-1 overflow-auto">
                {(page?.versions ?? []).map((v, i, arr) => (
                  <div key={v.id} className="flex flex-wrap items-center gap-2 border-b border-white/5 py-1.5 text-xs">
                    <code className="min-w-0 break-all text-[var(--color-brand-primary)]">{v.id}</code>
                    <span className="min-w-0 flex-1 text-[var(--color-text-secondary)]">
                      {new Date(v.createdAt).toLocaleString()}
                      {i === arr.length - 1 ? " · latest" : i === 0 ? " · ingest" : ""}
                    </span>
                    <button onClick={() => doRollback(v.id)} className="min-h-11 shrink-0 rounded-md border border-[var(--color-line-strong)] px-3 py-2 text-[var(--color-text-secondary)] hover:bg-white/5">
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </section>
            </div>
          </aside>
      )}
    </div>
  );
}
