import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectViaUpstreamConnection} from '../src/decision/v3-ha-upstream-read-bridge.mjs';

const allowed=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
test('upstream injected Connection sends six fixed registry-only requests, never authorizes',async()=>{
 const calls=[];
 const connection={connected:true,closeRequested:false,socket:{},async sendMessagePromise(command){calls.push(command);return [];}};
 const result=await inspectViaUpstreamConnection({connection});
 assert.equal(result.authorization,false);
 assert.equal(result.ready,false);
 assert.equal(calls.length,6);
 assert.ok(calls.every(c=>allowed.has(c.type)&&Object.keys(c).length===1));
});
test('upstream bridge rejects malformed client, rejected request and incomplete registry',async()=>{
 assert.equal((await inspectViaUpstreamConnection({connection:{}})).authorization,false);
 let count=0;
 const broken={connected:true,closeRequested:false,socket:{},sendMessagePromise:async()=>{count++;throw Error('offline disconnect');}};
 const failed=await inspectViaUpstreamConnection({connection:broken});
 assert.equal(failed.authorization,false);
 assert.equal(count,1);
 const oversized={connected:true,closeRequested:false,socket:{},sendMessagePromise:async()=>[{},{}]};
 const result=await inspectViaUpstreamConnection({connection:oversized,maxEntries:1});
 assert.equal(result.authorization,false);
 assert.equal(result.ready,false);
});

test('upstream bridge rejects disconnected or reconnecting clients without queuing',async()=>{
 let calls=0;
 for(const state of [{connected:false,socket:{}},{connected:true,socket:null},{connected:true,socket:{},closeRequested:true}]){
  const c={...state,sendMessagePromise:async()=>{calls++;return [];}};
  const result=await inspectViaUpstreamConnection({connection:c});
  assert.equal(result.authorization,false);
  assert.equal(result.reason,'upstream_not_connected');
 }
 assert.equal(calls,0);
});
test('socket replacement during read invalidates evidence, preventing later registry requests',async()=>{
 let calls=0;
 const connection={connected:true,closeRequested:false,socket:{},async sendMessagePromise(){
  calls++;if(calls===1)this.socket={};return [];
 }};
 const result=await inspectViaUpstreamConnection({connection});
 assert.equal(result.authorization,false);
 assert.equal(result.ready,false);
 assert.equal(result.reason,'registry_transport_failure');
 assert.equal(calls,1);
});

test('hung upstream registry read times out without advancing to another command',async()=>{
 let count=0;
 const connection={connected:true,closeRequested:false,socket:{},sendMessagePromise:async()=>{count++;return new Promise(()=>{});}};
 const result=await inspectViaUpstreamConnection({connection,timeoutMs:25});
 assert.equal(result.ready,false);
 assert.equal(result.authorization,false);
 assert.equal(result.reason,'registry_transport_failure');
 assert.equal(count,1);
});

test('oversized registry payload fails closed without sending later registry commands',async()=>{
 let calls=0;
 const connection={connected:true,closeRequested:false,socket:{},sendMessagePromise:async()=>{calls++;return [{name:'x'.repeat(2048)}];}};
 const result=await inspectViaUpstreamConnection({connection,maxResponseBytes:1024});
 assert.equal(result.authorization,false);
 assert.equal(result.reason,'registry_transport_failure');
 assert.equal(calls,1);
 assert.equal((await inspectViaUpstreamConnection({connection,maxResponseBytes:1})).reason,'invalid_response_size_limit');
});

test('reconnect after several reads discards entire evidence and stops further requests',async()=>{
 let calls=0;
 const connection={connected:true,closeRequested:false,socket:{},async sendMessagePromise(){
  calls++;if(calls===4){this.connected=false;this.socket={};}return [];
 }};
 const result=await inspectViaUpstreamConnection({connection});
 assert.equal(result.ready,false);
 assert.equal(result.authorization,false);
 assert.equal(result.reason,'registry_transport_failure');
 assert.equal(calls,4);
});

test('late upstream response after timeout cannot resume later registry reads',async()=>{
 let calls=0,resolveFirst;
 const connection={connected:true,closeRequested:false,socket:{},sendMessagePromise(){
  calls++;return new Promise(resolve=>{if(calls===1)resolveFirst=resolve;});
 }};
 const result=await inspectViaUpstreamConnection({connection,timeoutMs:10});
 assert.equal(result.ready,false);
 assert.equal(result.authorization,false);
 assert.equal(calls,1);
 resolveFirst([]);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(calls,1);
});

test('rejected registry response halts before any further reads',async()=>{
 let calls=0;
 const c={connected:true,closeRequested:false,socket:{},async sendMessagePromise(){calls++;if(calls===2)throw Error('registry_denied');return [];}};
 const r=await inspectViaUpstreamConnection({connection:c});
 assert.equal(r.ready,false);assert.equal(r.authorization,false);assert.equal(calls,2);
});

test('connection closure during later registry pass stops subsequent requests',async()=>{
 let calls=0;
 const c={connected:true,closeRequested:false,socket:{},async sendMessagePromise(){calls++;if(calls===5)this.closeRequested=true;return [];}};
 const r=await inspectViaUpstreamConnection({connection:c});
 assert.equal(r.ready,false);assert.equal(r.authorization,false);assert.equal(calls,5);
});
