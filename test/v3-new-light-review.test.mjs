import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectNewLights} from '../src/home/new-light-review.mjs';
import {NEW_LIGHT_CANDIDATES,NEW_LIGHT_IDS} from '../src/home/new-light-candidates.mjs';
test('bounded offline review reads only 19 new light IDs; no Browser Mod, switches or writes',async()=>{
 const seen=[];
 const r=await inspectNewLights({readState:async id=>{
  seen.push(id);
  return {structuredContent:{data:{entity_id:id,state:seen.length%2?'on':'off'}}};
 }});
 assert.equal(r.status,'complete');
 assert.deepEqual(seen,NEW_LIGHT_IDS);
 assert.equal(r.entries.length,19);
 assert.deepEqual(r.counts,{on:10,off:9,unknown:0});
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.ok(r.entries.every(x=>x.review==='unverified'&&!x.id.startsWith('light.browser_mod')));
});
test('mismatched identities, unavailable and exceptions are unknown, not OFF',async()=>{
 let n=0;
 const r=await inspectNewLights({readState:async id=>{
  n++;
  if(n===1)return {data:{entity_id:'light.spoof',state:'on'}};
  if(n===2)return {data:{entity_id:id,state:'unavailable'}};
  if(n===3)throw Error('HA unavailable');
  if(n===4)return {isError:true,structuredContent:{data:{entity_id:id,state:'on'}}};
  return {data:{entity_id:id,state:'off'}};
 }});
 assert.equal(r.status,'partial');assert.deepEqual(r.counts,{on:0,off:15,unknown:4});
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});
test('invalid inventories and missing reader reject all reads',async()=>{
 let called=0;const readState=()=>{called++;return {entity_id:'light.any',state:'on'}};
 const first=NEW_LIGHT_CANDIDATES[0];
 for(const candidates of [[first,first],[{...first,id:'light.browser_mod_bad'}],[{...first,id:'switch.light'}]]){
  const r=await inspectNewLights({readState,candidates});
  assert.equal(r.status,'invalid_inventory');assert.equal(r.entries.length,0);
 }
 assert.equal(called,0);
 assert.equal((await inspectNewLights()).status,'invalid_inventory');
});

test('unknown reasons distinguish unavailable, identity mismatch, MCP and transport errors',async()=>{
 let i=0;
 const r=await inspectNewLights({readState:async id=>{
  i++;
  if(i===1)return {data:{entity_id:id,state:'unavailable'}};
  if(i===2)return {data:{entity_id:id,state:'unknown'}};
  if(i===3)return {data:{entity_id:'light.spoof',state:'off'}};
  if(i===4)return {isError:true};
  if(i===5)throw Error('network');
  if(i===6)return {data:{entity_id:id,state:'unexpected'}};
  return {data:{entity_id:id,state:'off'}};
 }});
 assert.deepEqual(r.entries.slice(0,6).map(x=>x.reason),[
  'unavailable','unknown','identity_mismatch','mcp_error','read_error','invalid_state'
 ]);
 assert.deepEqual(r.counts,{on:0,off:13,unknown:6});
 assert.ok(r.entries.every(x=>x.review==='unverified'));
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});

test('10 HA unavailable entries recorded as unknown (not OFF) and next observation recovers',async()=>{
 const unavailableIds = new Set(NEW_LIGHT_IDS.slice(0, 10));

 const r1 = await inspectNewLights({readState: async id => {
  if (unavailableIds.has(id)) {
   return {data: {entity_id: id, state: 'unavailable'}};
  }
  return {data: {entity_id: id, state: 'off'}};
 }});

 assert.equal(r1.status, 'partial');
 assert.equal(r1.counts.unknown, 10);
 assert.equal(r1.counts.off, 9);
 assert.equal(r1.counts.on, 0);
 assert.equal(r1.authorization, false);
 assert.equal(r1.actualWrite, false);

 const unavailableEntries = r1.entries.filter(e => unavailableIds.has(e.id));
 assert.equal(unavailableEntries.length, 10);
 assert.ok(unavailableEntries.every(e => e.state === 'unknown' && e.reason === 'unavailable'));

 const r2 = await inspectNewLights({readState: async id => {
  if (unavailableIds.has(id)) {
   const index = NEW_LIGHT_IDS.indexOf(id);
   return {data: {entity_id: id, state: index % 2 === 0 ? 'on' : 'off'}};
  }
  return {data: {entity_id: id, state: 'off'}};
 }});

 assert.equal(r2.status, 'complete');
 assert.equal(r2.counts.unknown, 0);
 assert.equal(r2.counts.on, 5);
 assert.equal(r2.counts.off, 14);
 assert.equal(r2.authorization, false);
 assert.equal(r2.actualWrite, false);
 assert.ok(r2.entries.every(e => e.reason === 'ok' && (e.state === 'on' || e.state === 'off')));
});

test('connection failure is independent of entity unavailable state',async()=>{
 const rUnavailable = await inspectNewLights({readState: async id => {
  return {data: {entity_id: id, state: 'unavailable'}};
 }});
 assert.ok(rUnavailable.entries.every(e => e.state === 'unknown' && e.reason === 'unavailable'));

 const rTransportErr = await inspectNewLights({readState: async () => {
  throw new Error('Connection failed: socket hangup');
 }});
 assert.ok(rTransportErr.entries.every(e => e.state === 'unknown' && e.reason === 'read_error'));

 const rMcpErr = await inspectNewLights({readState: async () => {
  return {isError: true, error: 'MCP tool invocation failed'};
 }});
 assert.ok(rMcpErr.entries.every(e => e.state === 'unknown' && e.reason === 'mcp_error'));

 let count = 0;
 const rMixed = await inspectNewLights({readState: async id => {
  count++;
  if (count === 1) return {data: {entity_id: id, state: 'unavailable'}};
  if (count === 2) throw new Error('Connection refused');
  if (count === 3) return {isError: true};
  return {data: {entity_id: id, state: 'on'}};
 }});

 assert.equal(rMixed.entries[0].reason, 'unavailable');
 assert.equal(rMixed.entries[1].reason, 'read_error');
 assert.equal(rMixed.entries[2].reason, 'mcp_error');
 assert.equal(rMixed.entries[3].reason, 'ok');
 assert.equal(rMixed.authorization, false);
 assert.equal(rMixed.actualWrite, false);
});
