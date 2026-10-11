import test from 'node:test';import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';
import {createStageBatchHttpSimulation} from '../src/ops/stage-batch-http-simulation.mjs';
const policy={version:1,default:'deny',entities:{'light.a':{level:'confirm',services:['turn_on','turn_off']},'light.b':{level:'confirm',services:['turn_on','turn_off']}}};
const actor={userId:7,chatId:7};
const entities=['light.a','light.b'].map(id=>({entityId:id,name:id,areaId:'tambur',deviceId:id,available:true,disabled:false}));
const requests=entities.map(x=>({name:x.entityId,areaId:x.areaId}));
async function scenario(options,fn){const m=createStageMockHa(options);const address=await m.start();try{await fn(`http://127.0.0.1:${address.port}`);}finally{await m.close();}}
test('separate live HTTP reads at issue/confirm only simulate batch',async()=>{await scenario({entities},async base=>{const s=createStageBatchHttpSimulation({baseUrl:base,policy});const p=await s.issue({actor,requests});assert.equal(p.status,'pending');assert.deepEqual(await s.confirm({actor,token:p.token}),{status:'simulated',authorized:false,actualWrite:false,entityIds:['light.a','light.b']});});});
test('dropped second registry HTTP read refuses confirmation',async()=>{await scenario({entities,registryFault:'drop'},async base=>{const s=createStageBatchHttpSimulation({baseUrl:base,policy});const p=await s.issue({actor,requests});assert.equal(p.status,'pending');const r=await s.confirm({actor,token:p.token});assert.equal(r.reason,'stage_snapshot_unavailable');assert.equal(r.actualWrite,false);});});
test('remote endpoints never accessed',async()=>{const s=createStageBatchHttpSimulation({baseUrl:'http://192.168.31.94:9584',policy});assert.equal((await s.issue({actor,requests})).reason,'invalid_stage_endpoint');});
test('expired intent is denied after second fresh registry read',async()=>{await scenario({entities},async base=>{let now=Date.now()+1000;const s=createStageBatchHttpSimulation({baseUrl:base,clock:()=>now,policy});const p=await s.issue({actor,requests});assert.equal(p.status,'pending');now+=60001;const result=await s.confirm({actor,token:p.token});assert.equal(result.status,'denied');assert.equal(result.actualWrite,false);});});
test('delayed second registry HTTP read blocks confirmation',async()=>{await scenario({entities,registryFault:'delay',delayMs:1000},async base=>{const s=createStageBatchHttpSimulation({baseUrl:base,clock:()=>Date.now()-30001,policy});const p=await s.issue({actor,requests});assert.equal(p.status,'denied');assert.equal(p.actualWrite,false);});});
test('foreign actor never receives batch execution',async()=>{await scenario({entities},async base=>{const s=createStageBatchHttpSimulation({baseUrl:base,policy});const p=await s.issue({actor,requests});assert.equal(p.status,'pending');const r=await s.confirm({actor:{userId:999,chatId:999},token:p.token});assert.equal(r.status,'denied');assert.equal(r.actualWrite,false);});});

test('failed confirm read invalidates pending token even after registry recovers',async()=>{
 let reads=0;const headers={get:()=> 'application/json'};
 const fetchImpl=async()=>{reads++;if(reads===2)throw Error('simulated disconnect');return {status:200,headers,json:async()=>({environment:'stage',mode:'mock',authorization:false,complete:true,partial:false,has_more:false,next_offset:null,capturedAt:Date.now(),entities})};};
 const s=createStageBatchHttpSimulation({baseUrl:'http://127.0.0.1:12345/',fetchImpl,policy});
 const pending=await s.issue({actor,requests});assert.equal(pending.status,'pending');
 assert.equal((await s.confirm({actor,token:pending.token})).reason,'stage_snapshot_unavailable');
 assert.equal((await s.confirm({actor,token:pending.token})).reason,'missing_expired_or_used_intent');
 assert.equal(reads,3);
});
