import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const publicRoot = path.join(repo, 'public');
const kumoRoot = path.join(publicRoot, 'kumo');
const origin = 'https://rapidstudios.dev';
const expectedApi = new Set([
  '/api/kumo/entitlement',
  '/api/kumo/deals',
  '/api/kumo/demo/session',
  '/api/kumo/demo/billing',
  '/api/kumo/logout',
]);
const seenApi = new Set();
let checkedReferences = 0;

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(file));
    else result.push(file);
  }
  return result;
}

async function checkReference(reference, source) {
  if (!reference || reference.includes('${') || /^(?:https?:|data:|mailto:|tel:)/.test(reference)) return;
  const relative = path.relative(publicRoot, source).split(path.sep).join('/');
  const url = new URL(reference, `${origin}/${relative}`);
  if (url.pathname.startsWith('/api/')) {
    assert(expectedApi.has(url.pathname), `${relative}: unexpected API route ${url.pathname}`);
    seenApi.add(url.pathname);
    return;
  }
  assert(url.pathname === '/kumo' || url.pathname.startsWith('/kumo/'), `${relative}: reference escapes /kumo: ${reference}`);
  if (!reference.startsWith('#')) assert(reference.startsWith('/kumo'), `${relative}: asset/navigation must use explicit /kumo path: ${reference}`);
  const targetPath = url.pathname === '/kumo' || url.pathname === '/kumo/' ? '/kumo/index.html' : url.pathname;
  const target = path.join(publicRoot, decodeURIComponent(targetPath));
  assert((await stat(target)).isFile(), `${relative}: missing file ${targetPath}`);
  if (url.hash && target.endsWith('.html')) {
    const html = await readFile(target, 'utf8');
    const id = decodeURIComponent(url.hash.slice(1));
    assert(html.includes(`id="${id}"`) || html.includes(`id='${id}'`), `${relative}: missing anchor ${reference}`);
  }
  checkedReferences += 1;
}

const files = await filesUnder(kumoRoot);
assert(!files.some(file => /(?:presenter\.(?:html|js)|google-flow-presenter-prompt\.txt|studio\.css)$/.test(file)), 'Authoring assets must not ship in the public pitch');

for (const file of files.filter(file => /\.(?:html|js|css)$/.test(file))) {
  const content = await readFile(file, 'utf8');
  const references = new Set();
  for (const match of content.matchAll(/(?:href|src|poster)=["']([^"']+)["']/g)) references.add(match[1]);
  for (const match of content.matchAll(/url\(\s*["']?([^\s)'";]+)/g)) references.add(match[1]);
  for (const match of content.matchAll(/["'`]((?:\/[A-Za-z0-9][^"'`\s<>]*|\/(?:#[^"'`\s<>]*)?))(?=["'`])/g)) references.add(match[1]);
  for (const reference of references) await checkReference(reference, file);
}

assert.deepEqual(seenApi, expectedApi, 'Every demo API route must use the /api/kumo namespace');
const manifestFile = path.join(kumoRoot, 'manifest.webmanifest');
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
assert.equal(manifest.scope, '/kumo/');
assert.equal(manifest.id, '/kumo/');
assert.equal(manifest.start_url, '/kumo/app.html');
for (const icon of manifest.icons) await checkReference(icon.src, manifestFile);

const index = await readFile(path.join(kumoRoot, 'index.html'), 'utf8');
assert(index.includes('<iframe src="/kumo/app.html"'), 'Phone preview must load the namespaced app');
assert(index.includes('$15,000'), 'Approved offer must be retained');
assert(index.includes('https://calendly.com/rapidstudios/free-15-minute-website-automation-consult'), 'Approved booking URL must be retained');
console.log(`Kumo static checks passed: ${files.length} files, ${checkedReferences} local references, ${seenApi.size} namespaced API routes, valid scoped manifest.`);
