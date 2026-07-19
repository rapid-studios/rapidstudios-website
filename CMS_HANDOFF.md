# Rapid Studios CMS production handoff

The marketing site and CMS are one Next.js application. The marketing pages
remain public; the owner console is at `/studio`, the client console is at
`/studio/client`, and the CMS API is under `/api/cms/*`.

## Production deployment

`rapidstudios.dev` is deployed from the `main` branch of
`rapid-studios/rapidstudios-website` by the existing Vercel Git integration.
Production releases must use this path:

1. Create a branch and open a pull request.
2. Validate the Vercel preview deployment.
3. Merge the pull request into `main`.
4. Verify the production deployment and `https://rapidstudios.dev`.

Do not add a Vercel access token to the CMS. The CMS's experimental single-page
publisher intentionally remains in dry-run mode unless both
`CMS_ENABLE_EXPERIMENTAL_PUBLISH=1` and `VERCEL_TOKEN` are present. That path is
not suitable for this Git-managed, multi-page production site and those
variables should remain unset in Vercel.

## Required Vercel environment variables

Set these for Preview and Production:

```text
CMS_STORE=mongo
MONGODB_URI=<MongoDB Atlas connection string>
CMS_JWT_SECRET=<long random secret>
CMS_OWNER_KEY=<long random break-glass key>
```

Optional database names have safe defaults:

```text
MONGODB_DB=rapidstudios_cms
MONGODB_COLLECTION=sites
MONGODB_OWNERS_COLLECTION=cms_owners
```

The application fails closed in production if MongoDB is not configured. The
file store is for local development only; Vercel's filesystem is ephemeral.

Remote URL ingestion is disabled in production unless
`CMS_ALLOW_REMOTE_INGEST=1` is explicitly configured. Prefer raw HTML ingestion
or a dedicated capture worker. If remote ingestion is enabled later, keep the
SSRF protections in `lib/cms/ingest/fetch-rendered.ts` intact.

Optional AI translation uses either `ANTHROPIC_API_KEY` or
`OPENROUTER_API_KEY`. With neither, the CMS uses its offline heuristic.

## Local setup and verification

```bash
npm ci
cp .env.example .env.local
npm run lint
npm run build
CMS_OWNER_KEY=secret123 CMS_JWT_SECRET=devsecret CMS_STORE=file node scripts/cms/smoke.mjs
```

Then run `npm run dev` and open `http://localhost:3100/studio`.

The smoke test covers authentication, authorization, site creation, HTML
ingestion, Guardian rejection, client approval gating, AI editing, rollback,
dry-run publishing, and the edit overlay.

## Security invariants

- Content edits are `{ slotId, newValue }` proposals against a fixed slot set.
- Every proposal passes `validateBatch` before the content map changes.
- Theme changes use validated tokens; arbitrary CSS and HTML are rejected.
- Captured HTML must be sanitized before it reaches previews or publishing.
- Preview messaging must validate its source window and per-session nonce.
- Owner and client login endpoints are rate-limited; client passwords are
  length-bounded before scrypt runs.
- Production data must use MongoDB. Never commit `.env*`, `.cms-data`, Vercel
  metadata, access tokens, database credentials, or owner keys.

## CMS structure

```text
app/studio/                 Owner and client interfaces
app/api/cms/                Authentication and CMS route handlers
lib/cms/auth/               Tokens, password hashing, guards, rate limiting
lib/cms/design/             Theme tokens, presets, and design validation
lib/cms/ingest/             Capture, SSRF checks, sanitization, slot mapping
lib/cms/store/              Local development and MongoDB stores
lib/cms/guardian.ts         Deterministic content validation
lib/cms/render.ts           Template and content-map rendering
lib/cms/publish.ts          Experimental publisher; dry-run by default
scripts/cms/smoke.mjs       End-to-end local API smoke test
```

Keep the public marketing application and CMS implementation decoupled. No
marketing module should depend on CMS code.
