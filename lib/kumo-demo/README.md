# Kumo concept demo API

The `/kumo` concept uses fictional deals and a synthetic subscription. No account,
payment, Stripe request, or Kumo integration occurs. Session and billing buttons are
public demonstration controls, not production authentication or billing.

`node scripts/kumo/prepare.mjs` runs before development and production builds. It
generates `session-key.generated.json`, which must stay ignored by Git and outside
`public/`. The server-only module imports this key and the fictional deal fixture
statically so every server instance from one build uses the same signed sessions.
The key is never sent to the browser. An existing `KUMO_SESSION_SECRET` of at least
32 bytes overrides the generated key; no environment setup is required otherwise.

Cookies expire after 30 minutes and use `HttpOnly`, `SameSite=Lax`, and `Secure`
with the `__Host-kumo_demo_session` name in production. A new build rotates the
generated key and invalidates older sessions. Stateless demo logout clears the
browser cookie, and billing replaces it. A copied prior cookie remains replayable
until its original expiry or key rotation. Real access needs shared revocation and
entitlement storage, authenticated accounts, and verified payment webhooks.

Mutations require an exact matching Origin and Host. Production permits only
`https://rapidstudios.dev`, `https://www.rapidstudios.dev`, and exact hostnames from
trusted Vercel deployment environment variables. Preview domains have no wildcard.
Development additionally permits HTTP loopback hosts; it never permits arbitrary
LAN or external HTTP hosts. JSON bodies have a 4 KiB streamed limit and exact fields.
Responses are not cached, and no wildcard CORS headers are returned.

| Method | Path | Behavior |
| --- | --- | --- |
| POST | `/api/kumo/demo/session` | Start synthetic session with `{ "status": "active" }` or `"expired"` |
| GET | `/api/kumo/entitlement` | Read the signed demo entitlement |
| GET | `/api/kumo/deals` | Return fictional deals only with active entitlement |
| POST | `/api/kumo/demo/billing` | Replace existing demo entitlement with exact status JSON |
| POST | `/api/kumo/logout` | Clear demo cookie |

Run `node --test scripts/kumo/handler.test.mjs` using a Node version with native
TypeScript stripping (Node 22.18 or newer). Tests use injected clocks and isolated
test keys, with no Next.js dependencies, network, or generated-key access.
