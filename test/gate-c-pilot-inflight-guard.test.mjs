import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';

const actor={userId:123,chatId:123};
const intent='включи свет в тамбуре';
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};

test('an unresolved dispatch blocks new intents, concurrent confirms and write retries',async()=>{
 const wait=deferred();let writes=0;
 const pilot=createKitchenDryrunConsent({dispatch:async()=>{writes++;return wait.promise;}});
 assert.equal(pilot.request(actor,intent).status,'pending');
 const first=pilot.confirm(actor);
 await Promise.resolve();
 assert.equal(writes,1);
 assert.equal(pilot.request(actor,'выключи свет в тамбуре').reason,'action_in_flight');
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(pilot.cancel(actor),false);
 wait.resolve({status:'unverified',reason:'state_pending'});
 assert.equal((await first).status,'unverified');
 assert.equal(writes,1);
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(pilot.request(actor,intent).status,'pending');
});

test('unknown MCP outcome does not retry, and actor lock releases for fresh explicit consent',async()=>{
 let writes=0;
 const pilot=createKitchenDryrunConsent({dispatch:async()=>{writes++;throw new Error('mcp timeout after possible write');}});
 assert.equal(pilot.request(actor,intent).status,'pending');
 assert.deepEqual(await pilot.confirm(actor),{status:'failed',reason:'dispatch_exception'});
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(writes,1);
 assert.equal(pilot.request(actor,intent).status,'pending');
});

test('journal mark failure never causes another write or hangs actor guard',async()=>{
 let writes=0;
 const pilot=createKitchenDryrunConsent({
  executionJournal:{claim:()=>true,mark:()=>{throw new Error('journal unavailable');}},
  dispatch:async()=>{writes++;return {status:'verified'};}
 });
 assert.equal(pilot.request(actor,intent).status,'pending');
 const result=await pilot.confirm(actor);
 assert.equal(result.status,'failed');
 assert.equal(result.reason,'dispatch_exception');
 assert.equal(writes,1);
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(pilot.request(actor,intent).status,'pending');
});
