import test from 'node:test';import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';
import {createStageBatchHttpSimulation} from '../src/ops/stage-batch-http-simulation.mjs';
const actor={userId:7,chatId:7};
const entities=['light.a','light.b'].map(id=>({entityId:id,name:id,areaId:'tambur',deviceId:id,available:true,disabled:false}));
const requests=entities.map(x=>({name:x.entityId,areaId:x.areaId}));
async function scenario(options,fn){const m=createStageMockHa(options);const address=await m.start();try{await fn(`http://127.0.0.1:${address.port}`);}finally{await m.close();}}
test('separate live HTTP reads at issue/confirm only simulate batch',async()=>{await scenario({entities},async base=>{const s=createStageBatchHttpSimulation({baseUrl:base});const p=await s.issue({actor,requests});assert.equal(p.status,'pending');assert.deepEqual(await s.confirm({actor,token:p.token}),{status:'simulated',authorized:false,actualWrite:false,entityIds:['light.a','light.b']});});});
test('dropped second registry HTTP read refuses confirmation',async()=>{await scenario({entities,registryFault:'drop'},async base=>{const s=createStageBatchHttpSimulation({baseUrl:base});const p=await s.issue({actor,requests});assert.equal(p.status,'pending');const r=await s.confirm({actor,token:p.token});assert.equal(r.reason,'stage_snapshot_unavailable');assert.equal(r.actualWrite,false);});});
test('remote endpoints never accessed',async()=>{const s=createStageBatchHttpSimulation({baseUrl:'http://192.168.31.94:9584'});assert.equal((await s.issue({actor,requests})).reason,'invalid_stage_endpoint');});
