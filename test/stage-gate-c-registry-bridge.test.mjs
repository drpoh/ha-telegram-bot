import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageMockHa} from '../src/ops/stage-mock-ha.mjs';
import {inspectHaRegistryReadOnly} from '../src/decision/v3-ha-registry-read-adapter.mjs';

// Isolated HTTP fixture adapter: NOT the live HA WebSocket protocol. Used only
// to check real loopback I/O, timeout, and fail-closed registry composition.
test('Gate C: six stage HTTP fixture reads produce review only, never authorization',async()=>{
 const mock=createStageMockHa();const address=await mock.start();
 let calls=0;
 try{
  const url=`http://127.0.0.1:${address.port}/registry`;
  const result=await inspectHaRegistryReadOnly({request:async command=>{
   assert.ok(['config/entity_registry/list','config/device_registry/list','config/area_registry/list'].includes(command.type));
   const response=await fetch(url);assert.equal(response.status,200);calls++;
   const body=await response.json();
   return body[{ 'config/entity_registry/list':'entities','config/device_registry/list':'devices','config/area_registry/list':'areas'}[command.type]];
  }});
  assert.equal(calls,6);
  assert.equal(result.status,'read_only_review');
  assert.equal(result.authorization,false);
  const forbidden=await fetch(`http://127.0.0.1:${address.port}/api/services/light/turn_on`,{method:'POST'});
  assert.equal(forbidden.status,403);
 }finally{await mock.close();}
});

test('Gate C: malformed stage response and unreachable endpoint fail closed',async()=>{
 const mock=createStageMockHa();const address=await mock.start();
 try{
  const result=await inspectHaRegistryReadOnly({request:async()=>{
   const response=await fetch(`http://127.0.0.1:${address.port}/health`);
   return response.json();
  }});
  assert.equal(result.authorization,false);
  assert.equal(result.reason,'invalid_registry_response');
 }finally{await mock.close();}
 const result=await inspectHaRegistryReadOnly({request:async()=>{throw Error('connection_refused');}});
 assert.equal(result.authorization,false);
 assert.equal(result.reason,'registry_transport_failure');
});

test('Gate C: delayed second stage read exceeds deadline without retry or authorization',async()=>{
 const mock=createStageMockHa({registryFault:'delay',delayMs:160});const address=await mock.start();
 let calls=0;
 try{
  const result=await inspectHaRegistryReadOnly({timeoutMs:45,request:async command=>{
   calls++;
   const response=await fetch(`http://127.0.0.1:${address.port}/registry`);
   const body=await response.json();
   return body[{'config/entity_registry/list':'entities','config/device_registry/list':'devices','config/area_registry/list':'areas'}[command.type]];
  }});
  assert.equal(result.authorization,false);
  assert.equal(result.reason,'registry_transport_failure');
  await new Promise(resolve=>setTimeout(resolve,180));
  // Under heavy Pi load the first read may itself exceed the deadline;
  // either early failure or second-read failure must deny with no retries.
  assert.ok(calls>=1 && calls<=2);
 }finally{await mock.close();}
});

test('Gate C: dropped second stage read fails closed without retry',async()=>{
 const mock=createStageMockHa({registryFault:'drop'});const address=await mock.start();
 let calls=0;
 try{
  const result=await inspectHaRegistryReadOnly({timeoutMs:500,request:async command=>{
   calls++;
   const response=await fetch(`http://127.0.0.1:${address.port}/registry`);
   const body=await response.json();
   return body[{'config/entity_registry/list':'entities','config/device_registry/list':'devices','config/area_registry/list':'areas'}[command.type]];
  }});
  assert.equal(result.authorization,false);
  assert.equal(result.reason,'registry_transport_failure');
  assert.equal(calls,2);
 }finally{await mock.close();}
});
