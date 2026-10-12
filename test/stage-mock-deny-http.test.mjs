import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';

test('Stage mock stays loopback-only and denies all write-like HTTP routes',async()=>{
 assert.throws(()=>createStageMockHa({host:'0.0.0.0'}),/invalid_stage_bind/);
 assert.throws(()=>createStageMockHa({host:'::1'}),/invalid_stage_bind/);
 const stage=createStageMockHa();
 const address=await stage.start();
 try{
  assert.equal(address.address,'127.0.0.1');
  const base=`http://127.0.0.1:${address.port}`;
  const routes=[
   ['POST','/api/services/light/turn_on'],
   ['POST','/services/light/turn_on'],
   ['POST','/mcp'],
   ['POST','/registry'],
   ['PUT','/registry'],
   ['DELETE','/registry'],
   ['GET','/api/states'],
   ['GET','/api/services'],
   ['GET','/config'],
  ];
  for(const [method,path] of routes){
   const r=await fetch(base+path,{method});
   assert.equal(r.status,403,method+' '+path);
   const json=await r.json();
   assert.equal(json.error,'stage_denied');
  }
  const registry=await (await fetch(base+'/registry')).json();
  assert.equal(registry.environment,'stage');
  assert.equal(registry.mode,'mock');
  assert.equal(registry.complete,true);
  assert.equal(registry.authorization,false);
  assert.deepEqual(registry.entities,[]);
  const health=await (await fetch(base+'/health')).json();
  assert.equal(health.haWrites,false);
 }finally{await stage.close();}
});
