# Kumo mobile pitch

The approved Rapid Studios pitch is published at `/kumo` through this repository's existing `main` → Vercel production deployment. The exact rewrite serves `public/kumo/index.html`; the rest of the agency website keeps its existing routes.

The page leads with the supplied 22-second presenter video and direct Calendly booking. The offer is $15,000 for production iOS and Android app development, testing, source handover, and App Store/Google Play submission, including two in-scope review/resubmission rounds. Integration feasibility and the stores' final approval remain conditions. The current click-through uses fictional businesses and simulated subscriptions.

## Runtime

- `public/kumo/` contains the reviewed static presentation, app, fonts, branding, final videos, captions, and posters. Internal links are prefixed with `/kumo`; API calls use `/api/kumo`.
- `app/api/kumo/[...path]/route.ts` exposes only the synthetic demo's session, entitlement, deal, simulated billing, and logout actions.
- `scripts/kumo/prepare.mjs` creates a random signing key before the Next build. Its generated JSON is ignored by Git and imported only by server code. All instances of a deployment use the same key; a new build can invalidate old demo sessions. No Vercel account change or new service is needed. An explicitly configured `KUMO_SESSION_SECRET` can override the generated key.
- Demo cookies are signed, HttpOnly, and short-lived. Production uses HTTPS, Secure cookies, and explicit same-origin mutation checks. The demonstration intentionally allows visitors to activate or expire their simulated subscription. This is unsuitable for real Kumo customer authorization or billing.
- No raw presenter footage, source music, credentials, private source captures, or authoring kit is deployed. Both finished videos remain identical to the approved source exports.

## Validation

Run `npm run test:kumo` for backend behavior and static path checks. `npm run build` generates the server key, runs those checks, and builds/type-checks the complete Next.js website. Check `/kumo` in a browser after deployment: watch and replay the video, open the app, enter the demo, filter and save a deal, expire/reactivate access, and follow the booking link without submitting an appointment.

The full media authoring project remains on the external drive at `/Volumes/MacStore/CodexProjects/kumo-mobile-pitch`; this directory holds the curated public release.
