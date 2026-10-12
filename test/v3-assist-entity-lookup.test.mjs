import test from 'node:test';import assert from 'node:assert/strict';
import{inspectAssistEntity}from '../src/decision/v3-assist-entity-lookup.mjs';
const entry={entity_id:'light.fixture',enabled:true,disabled_by:null,hidden:false,hidden_by:null,device_id:'device1',unique_id:'stable',platform:'mqtt',area_id:'sauna'};
const call=(changes={})=>inspectAssistEntity({entityId:'light.fixture',readEntity:async()=>({success:true,entity_id:'light.fixture',entity_entry:{...entry,...changes}})});
test('exact registry entry can be inspected without granting authorization',async()=>{const r=await call();assert.equal(r.verified,true);assert.equal(r.status,'entity_registry_verified_not_authorized');});
test('inherited/missing area fails closed',async()=>assert.equal((await call({area_id:null})).reason,'area_requires_device_registry'));
test('hidden disabled or missing identity fails closed',async()=>{for(const change of [{enabled:false},{disabled_by:'user'},{hidden:true},{device_id:null},{unique_id:null}])assert.equal((await call(change)).verified,false);});
test('mismatch and transport errors fail closed',async()=>{assert.equal((await inspectAssistEntity({entityId:'switch.fixture'})).verified,false);assert.equal((await inspectAssistEntity({entityId:'light.fixture',readEntity:async()=>{throw Error('offline')}})).verified,false);});
