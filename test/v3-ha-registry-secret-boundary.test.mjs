import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRegistrySecretBoundary} from '../src/decision/v3-ha-registry-secret-boundary.mjs';
const socket={exchange:async()=>null,close:async()=>{}};
test('injected protected dependencies keep token out of result metadata',async()=>{
 const token='offline-fixture-secret-123';
 const r=await inspectRegistrySecretBoundary({loadSecret:async()=>token,openSocket:async()=>socket,performRead:async({credential})=>credential===token});
 assert.equal(r.accepted,true);assert.equal(r.authorization,false);
 assert.equal(JSON.stringify({accepted:r.accepted,status:r.status}).includes(token),false);
 assert.equal(r.status,"offline_boundary_only");
});
test('invalid source, empty tokens and invalid sockets fail closed',async()=>{
 for(const data of [{},{loadSecret:()=>'' ,openSocket:()=>socket,performRead:()=>true},
  {loadSecret:()=>{throw Error('secret')},openSocket:()=>socket,performRead:()=>true},
  {loadSecret:()=> 'offline-fixture-secret-123',openSocket:()=>null,performRead:()=>true}]){
  const r=await inspectRegistrySecretBoundary(data);
  assert.equal(r.accepted,false);assert.equal(r.authorization,false);
 }
});
