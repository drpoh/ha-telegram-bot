import test from "node:test";
import assert from "node:assert/strict";
import { createClearAuthorization } from "../src/telegram/clear-authorization.mjs";

test("requires explicit request, then consumes once", () => {
  let now = 1000;
  const flow = createClearAuthorization({ now: () => now });
  assert.equal(flow.consume(123), false);
  assert.equal(flow.request(123), true);
  assert.equal(flow.consume(123), true);
  assert.equal(flow.consume(123), false);
});

test("cancel prevents confirmation and another user cannot consume", () => {
  const flow = createClearAuthorization();
  flow.request(123);
  assert.equal(flow.consume(456), false);
  assert.equal(flow.cancel(123), true);
  assert.equal(flow.consume(123), false);
});

test("confirmation expires after 60 seconds", () => {
  let now = 1000;
  const flow = createClearAuthorization({ now: () => now });
  flow.request(123);
  now += 60001;
  assert.equal(flow.consume(123), false);
  assert.equal(flow.consume(123), false);
});

test("new request replaces expiry and invalid IDs are rejected", () => {
  let now = 0;
  const flow = createClearAuthorization({ now: () => now });
  assert.equal(flow.request(undefined), false);
  assert.equal(flow.consume(undefined), false);
  assert.equal(flow.cancel(undefined), false);
  flow.request(123);
  now += 59000;
  flow.request(123);
  now += 59000;
  assert.equal(flow.consume(123), true);
});
