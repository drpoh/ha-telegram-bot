import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTimedLightIntent } from '../src/decision/timed-light-intent.mjs';

test('detects duration on requested room light command',()=>{
 assert.deepEqual(parseTimedLightIntent('выключи свет в гостиной на 1 минуту'),{
  kind:'timed_light',valid:true,action:'turn_off',durationSeconds:60,preposition:'на'
 });
});
test('detects spoken duration and delayed command without executing anything',()=>{
 assert.equal(parseTimedLightIntent('включи свет на две минуты')?.durationSeconds,120);
 assert.equal(parseTimedLightIntent('выключи свет через 5 секунд')?.preposition,'через');
});
test('ignores timeless commands and unrelated devices',()=>{
 assert.equal(parseTimedLightIntent('выключи свет в гостиной'),null);
 assert.equal(parseTimedLightIntent('выключи термостат на 1 минуту'),null);
});
test('fails closed for oversized durations',()=>{
 assert.deepEqual(parseTimedLightIntent('выключи свет на 900 часов'),{
  kind:'timed_light',valid:false,reason:'unsupported_duration'
 });
});
