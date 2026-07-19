"use client";
// app/studio/_components/Editor.tsx
// The editing surface, shared by the owner console and the client editor.
// - slot list with inline manual edits (through the Guardian)
// - AI chat box (proposes -> Guardian -> apply/queue)
// - live preview iframe (fetched with the token, injected via srcdoc)
// - owner-only: version history + rollback, approval queue, publish

import { useCallback, useEffect, useRef, useState } from "react";
import { cms, type ContentMap, type PageView, type PendingEntry } from "../_lib/cms-client";

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
  const [channelNonce] = useState(createEditorChannelNonce);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const contentMap: ContentMap = page?.contentMap ?? {};

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
      const th = await cms.getTheme(token, siteId);
      if (th.ok) setActiveTheme(th.data.theme);
    }
  }, [token, siteId, pageId, role]);

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
    if (!designBrief.trim()) return;
    setBusy(true);
    const res = await cms.aiTheme(token, siteId, designBrief.trim(), true);
    setBusy(false);
    if (res.ok && res.data.accepted) {
      setVerdict({ kind: "ok", text: `Restyled [${res.data.provider}]${res.data.presetId ? ` via ${res.data.presetId}` : ""}` });
      const th = await cms.getTheme(token, siteId);
      if (th.ok) setActiveTheme(th.data.theme);
      await refreshPreview();
    } else {
      setVerdict({ kind: "bad", text: `Restyle rejected: ${res.data.reason ?? res.data.error ?? "no applicable change"}` });
    }
  }

  async function resetTheme() {
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

  // Receive click-to-edit commits from the preview overlay.
  useEffect(() => {
    const onMessage = async (ev: MessageEvent) => {
      if (ev.source !== iframeRef.current?.contentWindow) return;
      const m = ev.data as { __cms?: boolean; channelNonce?: string; slotId?: string; newValue?: unknown } | null;
      if (
        !m ||
        m.__cms !== true ||
        m.channelNonce !== channelNonce ||
        typeof m.slotId !== "string" ||
        !/^[a-z]+_[0-9a-f]{10}$/.test(m.slotId) ||
        typeof m.newValue !== "string"
      ) return;
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
    setBusy(true);
    const res = await cms.publish(token, siteId, pageId);
    setBusy(false);
    if (res.ok && res.data.published) {
      setVerdict({ kind: "ok", text: `${res.data.dryRun ? "Published (dry-run)" : "Published"} — ${res.data.url} (${res.data.bytes} bytes)` });
    } else {
      setVerdict({ kind: "bad", text: `Publish failed — ${res.data.error ?? "error"}` });
    }
  }

  const slotEntries = Object.entries(contentMap);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left column: editing controls */}
      <div className="space-y-4">
        {verdict && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              verdict.kind === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
            }`}
          >
            {verdict.text}
          </div>
        )}

        <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Edit a slot</h3>
          <div className="space-y-2">
            <input
              className="w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
              placeholder="slot id (or click a slot below)"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
              placeholder="new value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => runManual(true)}
                disabled={busy}
                className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-40"
              >
                Validate
              </button>
              <button
                onClick={() => runManual(false)}
                disabled={busy}
                className="rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40"
              >
                {role === "client" ? "Submit" : "Apply"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Ask in plain English</h3>
          <input
            className="mb-2 w-full rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
            placeholder='e.g. "change the headline to Grow faster"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => runAi(false)}
              disabled={busy}
              className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-40"
            >
              Propose
            </button>
            <button
              onClick={() => runAi(true)}
              disabled={busy}
              className="rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40"
            >
              {role === "client" ? "Submit" : "Apply"}
            </button>
          </div>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Slots</h3>
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
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-white/5"
              >
                <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 uppercase text-[var(--color-text-secondary)]">{s.type}</span>
                <span className="truncate text-[var(--color-text-secondary)]">{String(s.value).slice(0, 70)}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right column: preview + owner tools */}
      <div className="space-y-4">
        <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Live preview — click any element to edit</h3>
            <button onClick={refreshPreview} className="rounded-lg border border-[var(--color-line-strong)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-white/5">
              Refresh
            </button>
          </div>
          <iframe
            ref={iframeRef}
            title="preview"
            sandbox="allow-scripts"
            referrerPolicy="same-origin"
            className="h-[360px] w-full rounded-lg border border-[var(--color-line-subtle)] bg-white"
          />
        </section>

        {role === "owner" && (
          <>
            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Design</h3>
                <div className="flex items-center gap-2">
                  {activeTheme && (
                    <button onClick={resetTheme} disabled={busy} className="rounded-lg border border-[var(--color-line-strong)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-white/5 disabled:opacity-40">
                      Restore original
                    </button>
                  )}
                  <span className="text-xs text-[var(--color-text-secondary)]">{activeTheme ? "themed" : "original"}</span>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    disabled={busy}
                    title={p.description}
                    className="rounded-md bg-white/5 px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-focus-ring)] hover:text-white disabled:opacity-40"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-line-subtle)] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-secondary)]/60"
                  placeholder='Describe a look, e.g. "dark neon, cyan buttons"'
                  value={designBrief}
                  onChange={(e) => setDesignBrief(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runDesignAi()}
                />
                <button onClick={runDesignAi} disabled={busy} className="rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-40">
                  Restyle
                </button>
              </div>
              <p className="mt-2 text-xs text-white/30">
                Structure and content stay locked. Only validated design tokens change, and one click restores the original.
              </p>
            </section>

            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-3 flex items-center justify-between">
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
                        <button onClick={() => decide(p, true)} className="rounded-md bg-emerald-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-400">
                          Approve
                        </button>
                        <button onClick={() => decide(p, false)} className="rounded-md border border-[var(--color-line-strong)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-white/5">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Version history</h3>
                <button
                  onClick={doPublish}
                  disabled={busy}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-40"
                >
                  Publish
                </button>
              </div>
              <div className="max-h-48 space-y-1 overflow-auto">
                {(page?.versions ?? []).map((v, i, arr) => (
                  <div key={v.id} className="flex items-center gap-2 border-b border-white/5 py-1.5 text-xs">
                    <code className="text-[var(--color-brand-primary)]">{v.id}</code>
                    <span className="flex-1 text-[var(--color-text-secondary)]">
                      {new Date(v.createdAt).toLocaleString()}
                      {i === arr.length - 1 ? " · latest" : i === 0 ? " · ingest" : ""}
                    </span>
                    <button onClick={() => doRollback(v.id)} className="rounded-md border border-[var(--color-line-strong)] px-2 py-0.5 text-[var(--color-text-secondary)] hover:bg-white/5">
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
