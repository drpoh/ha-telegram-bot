import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');

test('natural kitchen Telegram questions go only to scoped read-only client',()=>{
 const start=src.indexOf("if(intent==='kitchen_review')");
 const end=src.indexOf(';',start);
 assert.ok(start>0&&end>start);
 const route=src.slice(start,end+1);
 assert.match(route,/summarizeReviewedKitchenLights\(/);
 assert.match(route,/readState:id=>newLightRead\(id\)/);
 assert.doesNotMatch(route,/ha_call_service|pilot\.request|\.dispatch\(|\.confirm\(/);
 assert.match(src,/const newLightRead=createReviewedLightReadonlyReader\(\)/);
 assert.match(src,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
});
