import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectHaRegistryReadOnly} from '../src/decision/v3-ha-registry-read-adapter.mjs';
const fixture={
 'config/entity_registry/list':[{entity_id:'light.kitchen',device_id:'child',area_id:null}],
 'config/device_registry/list':[{id:'root',area_id:'kitchen'},{id:'child',parent_device_id:'root',area_id:null}],
 'config/area_registry/list':[{area_id:'kitchen'}],
};
const make=(edit=()=>{})=>{let calls=0;const seen=[];return {seen,request:async ({type})=>{seen.push(type);calls++;const data=structuredClone(fixture[type]);edit(data,type,calls);return data;}}};
test('exact allowlisted read requests and valid child relationships remain review-only',async()=>{
 const {request,seen}=make();const result=await inspectHaRegistryReadOnly({request});
 assert.equal(result.ready,false);assert.equal(result.authorization,false);
 assert.equal(result.status,'read_only_review');
 assert.deepEqual(seen,['config/entity_registry/list','config/device_registry/list','config/area_registry/list','config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
});
test('drift, missing parents and cyclic parent references fail closed',async()=>{
 const changed=make((data,type,n)=>{if(type==='config/entity_registry/list'&&n===4)data[0].area_id='kitchen';});
 assert.equal((await inspectHaRegistryReadOnly({request:changed.request})).reason,'registry_changed_between_passes');
 const missing=make((data,type)=>{if(type==='config/device_registry/list')data[1].parent_device_id='missing';});
 assert.equal((await inspectHaRegistryReadOnly({request:missing.request})).reason,'invalid_registry_relationship');
 const cyclic=make((data,type)=>{if(type==='config/device_registry/list')data[0].parent_device_id='child';});
 assert.equal((await inspectHaRegistryReadOnly({request:cyclic.request})).reason,'invalid_registry_relationship');
});
test('errors, oversized data, invalid options and timeout deny',async()=>{
 const thrown=()=>{throw Error('offline');};
 assert.equal((await inspectHaRegistryReadOnly({request:thrown})).authorization,false);
 const big=make();assert.equal((await inspectHaRegistryReadOnly({request:big.request,maxEntries:1})).reason,'invalid_registry_response');
 assert.equal((await inspectHaRegistryReadOnly({request:big.request,timeoutMs:0})).reason,'invalid_adapter_options');
 assert.equal((await inspectHaRegistryReadOnly({request:()=>new Promise(()=>{}),timeoutMs:5})).reason,'registry_transport_failure');
});

test('multi-light HA registry inspection is read-only and returns no candidate grants',async()=>{
 const multi=structuredClone(fixture);
 multi['config/entity_registry/list'].push({entity_id:'light.hall',device_id:'root',area_id:'kitchen'});
 const calls=[];
 const request=async ({type})=>{calls.push(type);return structuredClone(multi[type]);};
 const result=await inspectHaRegistryReadOnly({request});
 assert.equal(result.status,'read_only_review');
 assert.equal(result.ready,false);
 assert.equal(result.authorization,false);
 assert.equal(Object.hasOwn(result,'targets'),false);
 assert.equal(calls.length,6);
 assert.ok(calls.every(type=>type.startsWith('config/')&&type.endsWith('/list')));
});

test('multi-light orphan, duplicate or second-pass replacement denies entire inspection',async()=>{
 const changed=structuredClone(fixture);
 changed['config/entity_registry/list'].push({entity_id:'light.hall',device_id:'root',area_id:'kitchen'});
 for(const mutate of [
  data=>{data['config/entity_registry/list'][1].device_id='unknown';},
  data=>{data['config/entity_registry/list'][1].entity_id='light.kitchen';},
 ]){
  const data=structuredClone(changed);mutate(data);
  const outcome=await inspectHaRegistryReadOnly({request:async ({type})=>structuredClone(data[type])});
  assert.equal(outcome.authorization,false);
  assert.notEqual(outcome.status,'read_only_review');
 }
 let count=0;
 const changedDuringRead=await inspectHaRegistryReadOnly({request:async ({type})=>{
  const result=structuredClone(changed[type]);
  if(++count===4)result[1].device_id='other';
  return result;
 }});
 assert.equal(changedDuringRead.reason,'registry_changed_between_passes');
});
