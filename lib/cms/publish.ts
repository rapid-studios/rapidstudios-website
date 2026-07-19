// lib/cms/publish.ts
// Publish pipeline. Renders template + current content map into a clean static
// HTML bundle (overlay wiring stripped) and deploys it via the Vercel REST API.
// Production publishing is intentionally opt-in. The current publisher emits a
// single-page static bundle and must not be allowed to replace the Git-managed
// rapidstudios.dev project accidentally.

import { render } from "./render";
import { injectTheme, type ThemeTokens } from "./design/tokens";
import type { Page } from "./types";

const VERCEL_DEPLOY_URL = "https://api.vercel.com/v13/deployments";

export interface PublishResult {
  dryRun: boolean;
  url: string | null;
  deploymentId: string | null;
  bytes: number;
}

export function buildStaticBundle(page: Page, theme?: ThemeTokens | null): { files: { file: string; data: string }[]; html: string } {
  let html = injectTheme(render(page.template, page.contentMap), theme);
  html = html.replace(/\s+data-slot="[^"]*"/g, "");
  return { files: [{ file: "index.html", data: html }], html };
}

export async function publishToVercel(page: Page, opts: { projectName?: string; theme?: ThemeTokens | null } = {}): Promise<PublishResult> {
  const { files, html } = buildStaticBundle(page, opts.theme);
  const name = opts.projectName || "rapidstudios-site";
  const publishEnabled = process.env.CMS_ENABLE_EXPERIMENTAL_PUBLISH === "1";
  const vercelToken = process.env.VERCEL_TOKEN || null;

  if (!publishEnabled || !vercelToken) {
    return {
      dryRun: true,
      url: `https://${name}.example.vercel.app`,
      deploymentId: `dryrun_${Date.now()}`,
      bytes: html.length,
    };
  }

  const res = await fetch(VERCEL_DEPLOY_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${vercelToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name,
      files,
      projectSettings: { framework: null },
      target: "production",
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Vercel deploy failed ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { url?: string; id?: string };
  return {
    dryRun: false,
    url: data.url ? `https://${data.url}` : null,
    deploymentId: data.id || null,
    bytes: html.length,
  };
}
