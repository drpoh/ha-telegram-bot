import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeOnLights} from '../src/home/on-lights-summary.mjs';
const ids=['light.kukhnia','light.koridor'];
test('read-only overview returns explicitly scoped on lights',async()=>{
 const calls=[];
 const result=await summarizeOnLights({entityIds:ids,readState:async id=>{calls.push(id);return {entity_id:id,state:id===ids[0]?'on':'off'};}});
 assert.deepEqual(result.on,[ids[0]]);assert.deepEqual(result.off,[ids[1]]);
 assert.equal(result.authorization,false);assert.equal(result.actualWrite,false);
 assert.deepEqual(calls,ids);
});
test('all off is scoped, never implies all house lights',async()=>{
 const r=await summarizeOnLights({entityIds:ids,readState:async id=>({entity_id:id,state:'off'})});
 assert.match(r.text,/проверенных светильников/);assert.equal(r.checked,2);
});
test('missing, mismatched, unavailable or failed reads never produce incomplete overview',async()=>{
 for(const readState of [async()=>null,async()=>({entity_id:'light.other',state:'on'}),async id=>({entity_id:id,state:'unavailable'}),async()=>{throw Error('offline');}]){
  const r=await summarizeOnLights({entityIds:ids,readState});assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);
 }
});
test('reject duplicate, invalid, oversized and non-light targets before any reads',async()=>{
 let calls=0;const readState=async()=>{calls++;};
 for(const entityIds of [[],[ids[0],ids[0]],['switch.other'],['light.A'],Array(21).fill(ids[0])])
  assert.equal((await summarizeOnLights({entityIds,readState})).status,'unavailable');
 assert.equal(calls,0);
});
