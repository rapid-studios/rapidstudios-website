// Spawn a local development server, wait for ready, run smoke, kill server.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = 3100;
const B = `http://localhost:${PORT}`;
const DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "rapidstudios-cms-smoke-"));
const env = {
  ...process.env,
  NODE_ENV: "development",
  CMS_OWNER_KEY: "secret123",
  CMS_JWT_SECRET: "devsecret",
  CMS_STORE: "file",
  CMS_DATA_DIR: DATA_DIR,
};
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const server = spawn(process.execPath, [nextBin, "dev", "-p", String(PORT)], {
  cwd: process.cwd(),
  env,
  stdio: "ignore",
  detached: true,
});

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitReady() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${B}/api/cms/auth/owner`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ masterKey: "x" }),
      });
      if (res.status === 401) return true;
    } catch { /* not up yet */ }
    await sleep(500);
  }
  return false;
}

async function j(path, { method = "GET", token, cookie, body } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (cookie) headers.cookie = cookie;
  const res = await fetch(B + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = null; try { data = await res.json(); } catch {}
  const setCookie = res.headers.get("set-cookie");
  return { status: res.status, data, cookie: setCookie ? setCookie.split(";", 1)[0] : null };
}
async function text(path, token, extraHeaders = {}) {
  const res = await fetch(B + path, { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...extraHeaders } });
  return res.text();
}

const HTML = `<!doctype html><html><head><title>Acme</title></head><body>
<h1>Grow your business with Acme</h1><p>Trusted by teams.</p>
<a href="/signup">Start free trial</a><button>Buy now</button></body></html>`;

const out = [];
const log = (s) => out.push(s);
let failed = false;

try {
  const ready = await waitReady();
  if (!ready) throw new Error("server did not become ready");
  log("server ready ✓");

  log("1. bad key login → " + (await j("/api/cms/auth/owner", { method: "POST", body: { masterKey: "wrong" } })).status + " (want 401)");
  const ownerLogin = await j("/api/cms/auth/owner", { method: "POST", body: { masterKey: "secret123" } });
  const owner = ownerLogin.data.token;
  log("2. owner login → token " + (owner ? "len " + owner.length : "FAIL"));
  const ownerMe = await j("/api/cms/auth/me", { cookie: ownerLogin.cookie });
  if (ownerMe.status !== 200 || ownerMe.data.role !== "owner") throw new Error("owner cookie session did not restore");
  log("   owner cookie restore → " + ownerMe.data.role);

  const ownerEmail = `smoke-${Date.now()}@example.com`;
  const createdOwner = await j("/api/cms/auth/owners", {
    method: "POST",
    token: owner,
    body: { email: ownerEmail, password: "smoke-password-123" },
  });
  if (createdOwner.status !== 201) throw new Error(`owner creation failed (${createdOwner.status})`);
  const ownerList = await j("/api/cms/auth/owners", { cookie: ownerLogin.cookie });
  if (ownerList.status !== 200 || !ownerList.data.owners.some((account) => account.email === ownerEmail)) {
    throw new Error("created owner missing from owner list");
  }
  log("   owner create/list → " + ownerEmail);

  const cookieSites = await j("/api/cms/sites", { cookie: ownerLogin.cookie });
  if (cookieSites.status !== 200 || !Array.isArray(cookieSites.data)) throw new Error("owner cookie could not list sites");
  log("   owner cookie API → listed " + cookieSites.data.length + " sites");
  log("3. no-token create → " + (await j("/api/cms/sites", { method: "POST", body: { name: "x" } })).status + " (want 403)");

  const sid = (await j("/api/cms/sites", { method: "POST", token: owner, body: { name: "acme", requiresApproval: true } })).data.id;
  log("4. create site → " + sid);

  const ing = (await j(`/api/cms/sites/${sid}/ingest-html`, { method: "POST", token: owner, body: { html: HTML, route: "/" } })).data;
  const page = ing.pageId;
  log("5. ingest → page " + page + ", slots " + ing.slotCount);

  const bad = await j(`/api/cms/sites/${sid}/pages/${page}/changes`, { method: "POST", token: owner, body: { changes: [{ slotId: "cta-txt", newValue: "Go" }] } });
  log("6. Guardian cta-txt → status " + bad.status + ", accepted " + bad.data.accepted);

  await j(`/api/cms/sites/${sid}/auth`, { method: "POST", token: owner, body: { clientPassword: "client-password-123" } });
  const clientLogin = await j("/api/cms/auth/client", { method: "POST", body: { siteId: sid, password: "client-password-123" } });
  const client = clientLogin.data.token;
  log("7. client login → token " + (client ? "len " + client.length : "FAIL"));
  const clientMe = await j("/api/cms/auth/me", { cookie: clientLogin.cookie });
  if (clientMe.status !== 200 || clientMe.data.role !== "client" || clientMe.data.siteId !== sid) {
    throw new Error("client cookie session did not restore");
  }
  log("   client cookie restore → " + clientMe.data.siteId);

  const pageDoc = (await j(`/api/cms/sites/${sid}/pages/${page}`, { token: owner })).data;
  const headlineId = Object.entries(pageDoc.contentMap).find(([, v]) => String(v.value).includes("Grow your business"))?.[0];

  log("8. client GET full site → " + (await j(`/api/cms/sites/${sid}`, { token: client })).status + " (want 403)");

  const q = (await j(`/api/cms/sites/${sid}/pages/${page}/changes`, { method: "POST", token: client, body: { changes: [{ slotId: headlineId, newValue: "Client Headline" }] } })).data;
  log("9. client edit → accepted " + q.accepted + ", queued " + q.queued);
  log("   preview still original → " + (await text(`/api/cms/sites/${sid}/pages/${page}/preview`, owner)).includes("Grow your business with Acme"));

  const pend = (await j(`/api/cms/sites/${sid}/pages/${page}/pending`, { token: owner })).data.pending[0].id;
  log("10. client approve → " + (await j(`/api/cms/sites/${sid}/pages/${page}/pending/${pend}/approve`, { method: "POST", token: client })).status + " (want 403)");

  const appr = (await j(`/api/cms/sites/${sid}/pages/${page}/pending/${pend}/approve`, { method: "POST", token: owner })).data;
  log("11. owner approve → approved " + appr.approved + ", snapshot " + appr.snapshotId);
  log("    preview now new headline → " + (await text(`/api/cms/sites/${sid}/pages/${page}/preview`, owner)).includes("Client Headline"));

  const ai = (await j(`/api/cms/sites/${sid}/pages/${page}/ai`, { method: "POST", token: owner, body: { instruction: "change the cta to Book a call", apply: true } })).data;
  log("12. AI [" + ai.provider + "] → applied " + ai.applied + ", proposed " + JSON.stringify(ai.proposed));

  const versions = (await j(`/api/cms/sites/${sid}/pages/${page}`, { token: owner })).data.versions;
  const rb = (await j(`/api/cms/sites/${sid}/pages/${page}/rollback`, { method: "POST", token: owner, body: { snapshotId: versions[0].id } })).data;
  log("13. rollback → ok " + rb.ok + "; preview restored → " + (await text(`/api/cms/sites/${sid}/pages/${page}/preview`, owner)).includes("Grow your business with Acme"));

  const pub = (await j(`/api/cms/sites/${sid}/pages/${page}/publish`, { method: "POST", token: owner })).data;
  log("14. publish → published " + pub.published + ", dryRun " + pub.dryRun);

  const ep = await text(`/api/cms/sites/${sid}/pages/${page}/edit-preview`, owner, { "x-cms-editor-channel": "0123456789abcdef0123456789abcdef" });
  log("15. edit-preview overlay → " + (ep.includes("__cms_hint") && ep.includes("data-slot")));
} catch (e) {
  failed = true;
  log("SMOKE ERROR: " + e.message);
} finally {
  try {
    if (process.platform === "win32") server.kill();
    else process.kill(-server.pid);
  } catch {}
  try { rmSync(DATA_DIR, { recursive: true, force: true }); } catch {}
  console.log(out.join("\n"));
  process.exit(failed ? 1 : 0);
}
