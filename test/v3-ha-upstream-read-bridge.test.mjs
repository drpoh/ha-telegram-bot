import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectViaUpstreamConnection} from '../src/decision/v3-ha-upstream-read-bridge.mjs';

const allowed=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
test('upstream injected Connection sends six fixed registry-only requests, never authorizes',async()=>{
 const calls=[];
 const connection={async sendMessagePromise(command){calls.push(command);return [];}};
 const result=await inspectViaUpstreamConnection({connection});
 assert.equal(result.authorization,false);
 assert.equal(result.ready,false);
 assert.equal(calls.length,6);
 assert.ok(calls.every(c=>allowed.has(c.type)&&Object.keys(c).length===1));
});
test('upstream bridge rejects malformed client, rejected request and incomplete registry',async()=>{
 assert.equal((await inspectViaUpstreamConnection({connection:{}})).authorization,false);
 let count=0;
 const broken={sendMessagePromise:async()=>{count++;throw Error('offline disconnect');}};
 const failed=await inspectViaUpstreamConnection({connection:broken});
 assert.equal(failed.authorization,false);
 assert.equal(count,1);
 const oversized={sendMessagePromise:async()=>[{},{}]};
 const result=await inspectViaUpstreamConnection({connection:oversized,maxEntries:1});
 assert.equal(result.authorization,false);
 assert.equal(result.ready,false);
});
