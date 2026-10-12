import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';
import {checkEnvironmentBoundary} from '../src/ops/environment-boundary.mjs';

async function withStage(options,run){
 const mock=createStageMockHa(options);
 const addr=await mock.start();
 try {await run(`http://127.0.0.1:${addr.port}`);}
 finally {await mock.close();}
}

test('stage fixture is loopback-only, no production HA, no write endpoints',async()=>{
 assert.throws(()=>createStageMockHa({host:'0.0.0.0'}),/invalid_stage_bind/);
 await withStage({},async base=>{
  const health=await fetch(base+'/health').then(x=>x.json());
  assert.deepEqual(health,{ok:true,environment:'stage',mode:'mock',haWrites:false});
  const registry=await fetch(base+'/registry').then(x=>x.json());
  assert.equal(registry.environment,'stage');
  assert.equal(registry.authorization,false);
  assert.deepEqual(registry.entities,[]);
  assert.equal(registry.complete,true);
  for(const [method,path] of [['POST','/services/light/turn_on'],['GET','/api/states'],['POST','/registry']]){
   const response=await fetch(base+path,{method});
   assert.equal(response.status,403);
   assert.equal((await response.json()).error,'stage_denied');
  }
 });
 assert.deepEqual(checkEnvironmentBoundary({environment:'stage',toolName:'ha_call_service'}),{allowed:false,reason:'stage_read_only'});
 assert.deepEqual(checkEnvironmentBoundary({environment:'stage',toolName:'ha_get_state',realHa:true}),{allowed:false,reason:'stage_real_ha_requires_separate_approval'});
});

test('stage injected registry failure does not create HA authority',async()=>{
 await withStage({registryFault:'drop'},async base=>{
  assert.equal((await fetch(base+'/registry')).status,200);
  await assert.rejects(fetch(base+'/registry'));
  assert.equal((await fetch(base+'/health').then(r=>r.json())).haWrites,false);
 });
});
