import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const telegram=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
const router=readFileSync(new URL('../src/pilot/v3-readonly-question-router.mjs',import.meta.url),'utf8');

test('natural kitchen Telegram questions use injected exact-ID read-only router',()=>{
 assert.match(telegram,/routeV3ReadonlyQuestion\(/);
 assert.match(telegram,/readKitchenState:id=>newLightRead\(id\)/);
 assert.match(router,/if\(intent==='kitchen_review'\)result=await summarizeReviewedKitchenLights\(/);
 assert.match(router,/readState:readKitchenState/);
 assert.doesNotMatch(router,/ha_call_service|\.dispatch\(|pilot\.request|\.confirm\(/);
 assert.match(telegram,/const newLightRead=createReviewedLightReadonlyReader\(\)/);
 assert.match(telegram,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
});
