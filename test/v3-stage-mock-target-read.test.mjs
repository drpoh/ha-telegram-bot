import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';
import {resolveMockStageTarget} from '../src/ops/stage-target-read.mjs';
const light=(id,area='tambur',available=true)=>({entityId:id,name:'Свет',areaId:area,deviceId:'device-'+id,available,disabled:false});
async function run(options,work){const server=createStageMockHa(options);const a=await server.start();try{return await work('http://127.0.0.1:'+a.port);}finally{await server.close();}}
test('complete stage mock registry returns only a non-authorizing candidate',async()=>{
 await run({entities:[light('light.tambur_1'),light('light.kitchen_1','kitchen')]},async base=>{
  const r=await resolveMockStageTarget({baseUrl:base,name:'свет',areaId:'kitchen'});
  assert.equal(r.status,'candidate');assert.equal(r.authorized,false);assert.equal(r.entityId,'light.kitchen_1');
 });
});
test('duplicate light names in area are denied',async()=>{
 await run({entities:[light('light.tambur_1'),light('light.tambur_2')]},async base=>{
  const r=await resolveMockStageTarget({baseUrl:base,name:'свет',areaId:'tambur'});
  assert.equal(r.reason,'ambiguous_target');
 });
});
test('unavailable, wrong-area and bad endpoint fail closed',async()=>{
 await run({entities:[light('light.tambur_1','tambur',false)]},async base=>{
  assert.equal((await resolveMockStageTarget({baseUrl:base,name:'свет',areaId:'tambur'})).reason,'target_disabled_or_unavailable');
  assert.equal((await resolveMockStageTarget({baseUrl:base,name:'свет',areaId:'kitchen'})).reason,'target_not_found');
 });
 for(const baseUrl of ['http://192.168.31.94:9584','https://127.0.0.1:1234','http://127.0.0.1:1234/other'])
  assert.equal((await resolveMockStageTarget({baseUrl,name:'свет',areaId:'tambur'})).reason,'invalid_mock_endpoint');
});
test('dropped mock registry request fails closed',async()=>{
 await run({entities:[light('light.tambur_1')],registryFault:'drop'},async base=>{
  assert.equal((await resolveMockStageTarget({baseUrl:base,name:'свет',areaId:'tambur'})).status,'candidate');
  assert.equal((await resolveMockStageTarget({baseUrl:base,name:'свет',areaId:'tambur'})).reason,'mock_registry_unavailable');
 });
});
test('stage may never accept a server pretending to grant authorization',async()=>{
 const fake=async()=>new Response(JSON.stringify({environment:'stage',mode:'mock',authorization:true,complete:true,partial:false,has_more:false,next_offset:null,capturedAt:Date.now(),entities:[light('light.tambur_1')]}),{headers:{'content-type':'application/json'}});
 assert.equal((await resolveMockStageTarget({baseUrl:'http://127.0.0.1:3000',name:'свет',areaId:'tambur',fetchImpl:fake})).reason,'untrusted_mock_snapshot');
});
