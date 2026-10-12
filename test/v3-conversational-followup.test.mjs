import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveReadonlyFollowup } from '../src/home/conversational-followup.mjs';
import { resolveReadonlyFollowup as reexportedResolve } from '../src/home/readonly-question-intent.mjs';

test('re-exported resolver is identical to module export', () => {
  assert.equal(resolveReadonlyFollowup, reexportedResolve);
});

test('direct standalone questions resolve immediately without prior context', () => {
  const saunaRes = resolveReadonlyFollowup({ input: 'Какая температура в сауне?' });
  assert.equal(saunaRes.resolved, true);
  assert.equal(saunaRes.topic, 'sauna');
  assert.equal(saunaRes.mode, 'temperature');
  assert.equal(saunaRes.source, 'direct');

  const lightRes = resolveReadonlyFollowup({ input: 'Какой свет выключен?' });
  assert.equal(lightRes.resolved, true);
  assert.equal(lightRes.topic, 'lights');
  assert.equal(lightRes.mode, 'off');
  assert.equal(lightRes.source, 'direct');

  const tambourRes = resolveReadonlyFollowup({ input: 'Свет в тамбуре включен' });
  assert.equal(tambourRes.resolved, true);
  assert.equal(tambourRes.topic, 'tambour');
  assert.equal(tambourRes.mode, 'overview');
  assert.equal(tambourRes.source, 'direct');
});

test('sauna follow-ups resolve correctly with trusted prior sauna context', () => {
  const priorContext = { topic: 'sauna', actorId: 12345, timestamp: 1000000 };
  const currentActorId = 12345;
  const now = 1010000; // 10 seconds later

  const ready = resolveReadonlyFollowup({ input: 'А она готова?', priorContext, currentActorId, now });
  assert.equal(ready.resolved, true);
  assert.equal(ready.topic, 'sauna');
  assert.equal(ready.mode, 'ready');
  assert.equal(ready.source, 'followup');

  const temp = resolveReadonlyFollowup({ input: 'А какая температура?', priorContext, currentActorId, now });
  assert.equal(temp.resolved, true);
  assert.equal(temp.topic, 'sauna');
  assert.equal(temp.mode, 'temperature');
  assert.equal(temp.source, 'followup');

  const status = resolveReadonlyFollowup({ input: 'А что с ней?', priorContext, currentActorId, now });
  assert.equal(status.resolved, true);
  assert.equal(status.topic, 'sauna');
  assert.equal(status.mode, 'status');
  assert.equal(status.source, 'followup');
});

test('lights follow-ups resolve correctly with trusted prior lights context', () => {
  const priorContext = { topic: 'lights', actorId: 12345, timestamp: 1000000 };
  const currentActorId = 12345;
  const now = 1010000;

  const allOff = resolveReadonlyFollowup({ input: 'А весь?', priorContext, currentActorId, now });
  assert.equal(allOff.resolved, true);
  assert.equal(allOff.topic, 'lights');
  assert.equal(allOff.mode, 'all_off');
  assert.equal(allOff.source, 'followup');

  const off = resolveReadonlyFollowup({ input: 'А какой выключен?', priorContext, currentActorId, now });
  assert.equal(off.resolved, true);
  assert.equal(off.topic, 'lights');
  assert.equal(off.mode, 'off');
  assert.equal(off.source, 'followup');

  const overview = resolveReadonlyFollowup({ input: 'А какой включен?', priorContext, currentActorId, now });
  assert.equal(overview.resolved, true);
  assert.equal(overview.topic, 'lights');
  assert.equal(overview.mode, 'overview');
  assert.equal(overview.source, 'followup');
});

test('missing, stale, or untrusted prior context fails closed without inferring intent', () => {
  // Missing context
  const missing = resolveReadonlyFollowup({ input: 'А она готова?' });
  assert.equal(missing.resolved, false);
  assert.equal(missing.reason, 'missing_prior_context');

  // Unsupported topic
  const badTopic = resolveReadonlyFollowup({ input: 'А она готова?', priorContext: { topic: 'kitchen' } });
  assert.equal(badTopic.resolved, false);
  assert.equal(badTopic.reason, 'unsupported_topic_context');

  // Stale context (> 5 min)
  const stale = resolveReadonlyFollowup({
    input: 'А она готова?',
    priorContext: { topic: 'sauna', timestamp: 1000000 },
    now: 1000000 + 300001
  });
  assert.equal(stale.resolved, false);
  assert.equal(stale.reason, 'stale_prior_context');

  // Mismatched actor ID
  const wrongActor = resolveReadonlyFollowup({
    input: 'А она готова?',
    priorContext: { topic: 'sauna', actorId: 111 },
    currentActorId: 222
  });
  assert.equal(wrongActor.resolved, false);
  assert.equal(wrongActor.reason, 'mismatched_actor');
});

test('mismatched topic context (sauna question with light context) fails closed', () => {
  const mismatched = resolveReadonlyFollowup({
    input: 'А она готова?',
    priorContext: { topic: 'lights' }
  });
  assert.equal(mismatched.resolved, false);
  assert.equal(mismatched.reason, 'mismatched_topic_context');
});

test('action/command attempts in follow-up return unresolved without write authority', () => {
  const writeAttempt1 = resolveReadonlyFollowup({
    input: 'А выключи?',
    priorContext: { topic: 'lights' }
  });
  assert.equal(writeAttempt1.resolved, false);
  assert.equal(writeAttempt1.reason, 'unsupported_followup');

  const writeAttempt2 = resolveReadonlyFollowup({
    input: 'Включи свет в сауне',
    priorContext: { topic: 'sauna' }
  });
  assert.equal(writeAttempt2.resolved, false);
  assert.equal(writeAttempt2.reason, 'unsupported_followup');
});
