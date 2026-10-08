import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';
test('kitchen dry-run confirmation is one-shot, actor-bound, and never actuates',async()=>{
 let now=1000;const d=createKitchenDryrunConsent({clock:()=>now});const actor={userId:55,chatId:55};
 assert.equal(d.request(actor,'Включи свет на кухне').status,'pending');
 assert.equal((await d.confirm({userId:66,chatId:66})).status,'missing');
 assert.deepEqual(await d.confirm(actor),{status:'simulated',service:'turn_on',actualWrite:false});
 assert.equal((await d.confirm(actor)).status,'missing');
 assert.equal(d.request(actor,'Выключи свет на кухне').status,'pending');now+=60001;
 assert.equal((await d.confirm(actor)).status,'missing');
 assert.equal(d.request(actor,'Выключи весь свет').status,'unsupported');
 assert.equal(d.request(actor,'Включи свет на кухне').status,'pending');
 assert.equal(d.cancel(actor),true);assert.equal((await d.confirm(actor)).status,'missing');
});

test('end-to-end confirmed Telegram intent reaches deny-all boundary exactly once',async()=>{
 const {createKitchenMcpDispatchBoundary}=await import('../src/pilot/kitchen-mcp-dispatch-boundary.mjs');
 const boundary=createKitchenMcpDispatchBoundary({releaseEnabled:false});
 let attempts=0;const pilot=createKitchenDryrunConsent({dispatch:async ({action})=>{attempts++;return boundary.dispatch({action});}});
 const actor={userId:77,chatId:77};
 assert.equal(pilot.request(actor,'Включи свет на кухне').status,'pending');
 assert.equal((await pilot.confirm(actor)).reason,'live_release_disabled');
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(attempts,1);
});
