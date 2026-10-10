import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';

test('local stage HA mock only serves fixtures and denies writes',async()=>{
 assert.throws(()=>createStageMockHa({host:'0.0.0.0'}),/invalid_stage_bind/);
 const mock=createStageMockHa();
 const address=await mock.start();
 try{
  assert.equal(address.address,'127.0.0.1');
  const base=`http://127.0.0.1:${address.port}`;
  const health=await fetch(base+'/health');assert.equal(health.status,200);
  assert.deepEqual(await health.json(),{ok:true,environment:'stage',mode:'mock',haWrites:false});
  const registry=await fetch(base+'/registry');assert.equal(registry.status,200);
  assert.deepEqual(await registry.json(),{entities:[],devices:[],areas:[],authorization:false});
  for(const [method,path] of [['POST','/api/services/light/turn_on'],['GET','/api/states'],['DELETE','/registry'],['POST','/registry']]){
   const response=await fetch(base+path,{method});assert.equal(response.status,403);
  }
 }finally{await mock.close();}
});
