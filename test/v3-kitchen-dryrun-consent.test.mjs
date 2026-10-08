import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';
test('kitchen dry-run confirmation is one-shot, actor-bound, and never actuates',()=>{
 let now=1000;const d=createKitchenDryrunConsent({clock:()=>now});const actor={userId:55,chatId:55};
 assert.equal(d.request(actor,'Включи свет на кухне').status,'pending');
 assert.equal(d.confirm({userId:66,chatId:66}).status,'missing');
 assert.deepEqual(d.confirm(actor),{status:'simulated',service:'turn_on',actualWrite:false});
 assert.equal(d.confirm(actor).status,'missing');
 assert.equal(d.request(actor,'Выключи свет на кухне').status,'pending');now+=60001;
 assert.equal(d.confirm(actor).status,'missing');
 assert.equal(d.request(actor,'Выключи весь свет').status,'unsupported');
 assert.equal(d.request(actor,'Включи свет на кухне').status,'pending');
 assert.equal(d.cancel(actor),true);assert.equal(d.confirm(actor).status,'missing');
});
