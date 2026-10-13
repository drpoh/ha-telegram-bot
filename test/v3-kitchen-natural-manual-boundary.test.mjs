import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const manual=readFileSync(new URL('../scripts/manual/v3-kitchen-lights-readonly-preflight.mjs',import.meta.url),'utf8');
test('operator-only kitchen preflight has bounded reader, explicit flags, no bot or actuation',()=>{
 assert.match(manual,/--readonly --operator-approved/);
 assert.match(manual,/summarizeReviewedKitchenLights\(/);
 assert.match(manual,/createReviewedLightReadonlyReader\(\)/);
 assert.match(manual,/KITCHEN_READONLY_PHYSICAL_IDENTITY=unverified/);
 assert.match(manual,/KITCHEN_READONLY_STATUS=/);
 assert.doesNotMatch(manual,/ha_call_service|turn_on|turn_off|bot\.launch|new Telegraf|setInterval/);
});
