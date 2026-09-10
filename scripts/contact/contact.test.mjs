// Run: node --no-warnings --loader ./scripts/contact/test-loader.mjs --test scripts/contact/contact.test.mjs
import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

import { POST } from "../../app/api/contact/route.ts";
import { deliveries, outcomes, resetSender } from "./mock-resend.mjs";

const inquiry = {
  name: "Test Lead",
  email: "lead@example.com",
  company: "Example Company",
  projectType: "Marketing / launch site",
  note: "Private example project details for this test.",
  website: ""
};
const environmentKeys = ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_REPLY_TO", "EMAIL_NOTIFY"];
let savedEnvironment;
let nextIp = 0;
let logged;
let network;

beforeEach(() => {
  savedEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));
  process.env.RESEND_API_KEY = "re_test_stub_only";
  process.env.EMAIL_FROM = "test@example.com";
  process.env.EMAIL_REPLY_TO = "team@example.com";
  process.env.EMAIL_NOTIFY = "team@example.com";
  resetSender();
  logged = [];
  mock.method(console, "error", (...args) => logged.push(args));
  mock.method(console, "warn", (...args) => logged.push(args));
  network = mock.method(globalThis, "fetch", () => {
    throw new Error("Network access is prohibited in contact tests.");
  });
});

afterEach(() => {
  assert.equal(network.mock.callCount(), 0, "tests must never contact an external service");
  const logText = JSON.stringify(logged);
  for (const sensitive of [inquiry.name, inquiry.email, inquiry.company, inquiry.note, "provider-secret"]) {
    assert.equal(logText.includes(sensitive), false, "logs must not contain submitted data or raw provider errors");
  }
  for (const key of environmentKeys) {
    if (savedEnvironment[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnvironment[key];
  }
  mock.restoreAll();
});

function submit(payload = inquiry) {
  return POST(new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `192.0.2.${++nextIp}` },
    body: JSON.stringify(payload)
  }));
}

async function assertUnavailable(response) {
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.success, undefined);
  assert.match(body.error, /try again later/i);
  assert.match(body.error, /hello@rapidstudios\.dev/);
}

test("missing email credentials cannot report an inquiry as received", async () => {
  delete process.env.RESEND_API_KEY;
  await assertUnavailable(await submit());
  assert.equal(deliveries.length, 0);
});

test("blank email credentials cannot report an inquiry as received", async () => {
  process.env.RESEND_API_KEY = "   ";
  await assertUnavailable(await submit());
  assert.equal(deliveries.length, 0);
});

test("provider rejection fails the inquiry and does not send a customer receipt", async () => {
  outcomes.push({ data: null, error: { message: `provider-secret ${inquiry.email}` } });
  await assertUnavailable(await submit());
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].to, "team@example.com");
  assert.equal(deliveries[0].replyTo, inquiry.email);
});

test("a thrown notification request returns an actionable failure without a receipt", async () => {
  outcomes.push(new Error(`provider-secret ${inquiry.note}`));
  await assertUnavailable(await submit());
  assert.equal(deliveries.length, 1);
});

test("a response without a provider acceptance ID cannot count as success", async () => {
  outcomes.push({ data: null, error: null });
  await assertUnavailable(await submit());
  assert.equal(deliveries.length, 1);
});

test("an accepted team notification remains successful if the customer receipt fails", async () => {
  outcomes.push(
    { data: { id: "internal-accepted" }, error: null },
    { data: null, error: { message: `provider-secret ${inquiry.email}` } }
  );
  const response = await submit();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.deepEqual(deliveries.map((message) => message.to), ["team@example.com", inquiry.email]);
  assert.ok(logged.some((args) => args.join(" ").includes("customer acknowledgement failed")));
});

test("both accepted messages report success with the team notified before the customer", async () => {
  outcomes.push(
    { data: { id: "internal-accepted" }, error: null },
    { data: { id: "customer-accepted" }, error: null }
  );
  const response = await submit();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.deepEqual(deliveries.map((message) => message.to), ["team@example.com", inquiry.email]);
  assert.equal(outcomes.length, 0);
});

test("invalid inquiry fields are rejected before any notification is attempted", async () => {
  const response = await submit({ ...inquiry, email: "invalid", note: "short" });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(body.errors.email);
  assert.ok(body.errors.note);
  assert.equal(deliveries.length, 0);
});
