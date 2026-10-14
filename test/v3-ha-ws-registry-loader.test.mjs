import test from 'node:test';
import assert from 'node:assert/strict';
import {HA_REGISTRY_READ_COMMANDS} from '../src/home/ha-ws-registry-snapshot.mjs';
import {readHARegistrySnapshot,summarizeHARegistryRead} from '../src/home/ha-ws-registry-loader.mjs';
const fixtures=[
 [{floor_id:'ground',name:'Ground'}],
 [{area_id:'kitchen',floor_id:'ground',labels:['control']}],
 [{id:'abc1234',area_id:'kitchen',labels:['light'],disabled_by:null}],
 [{entity_id:'light.kitchen',device_id:'abc1234',area_id:null,labels:['light'],disabled_by:null,hidden_by:null}],
 [{label_id:'light',name:'Освещение'},{label_id:'control',name:'Управление'}]
];
const connection=(response=fixtures)=>{
 const calls=[];
 return {calls,async sendMessagePromise(message){
  calls.push(message);
  const index=HA_REGISTRY_READ_COMMANDS.indexOf(message.type);
  if(index===-1)throw Error('unexpected command');
  return response[index];
 }};
};
test('sequential five read-only command calls; returns counts but no permissions',async()=>{
 const c=connection();
 const result=await readHARegistrySnapshot(c);
 assert.equal(result.status,'validated_snapshot');
 assert.equal(result.complete,true);
 assert.equal(result.completed,5);
 assert.deepEqual(c.calls.map(x=>x.type),HA_REGISTRY_READ_COMMANDS);
 assert.ok(c.calls.every(x=>Object.keys(x).join(',')==='type'));
 assert.equal(result.counts.entities,1);
 assert.equal(result.entities[0].areaId,'kitchen');
 assert.deepEqual(result.entities[0].labelsBySource,{entity:['light'],device:['light'],area:['control']});
 assert.equal(result.authorizesRead,false);
 assert.equal(result.authorizesWrite,false);
 assert.deepEqual(summarizeHARegistryRead(result),{
  status:'validated_snapshot',completed:5,counts:result.counts,
  authorizesRead:false,authorizesWrite:false
 });
});
test('failed second read stops and does not leak provider exception',async()=>{
 const c=connection();const call=c.sendMessagePromise;
 c.sendMessagePromise=async function(message){
  if(message.type===HA_REGISTRY_READ_COMMANDS[1]){
   c.calls.push(message);
   throw Error('secret access denied');
  }
  return call.call(this,message);
 };
 const result=await readHARegistrySnapshot(c);
 assert.equal(result.status,'unverified');
 assert.equal(result.reason,'read_failed');
 assert.equal(result.section,'areas');
 assert.equal(result.completed,1);
 assert.equal(c.calls.length,2);
 assert.doesNotMatch(JSON.stringify(result),/secret access denied/);
 assert.equal(result.authorizesWrite,false);
});
test('compact entity list, missing sections, and dangling device never pass',async()=>{
 let values=fixtures.map(x=>structuredClone(x));
 values[3]={entities:[{ei:'light.kitchen'}]};
 assert.equal((await readHARegistrySnapshot(connection(values))).status,'unverified');
 values=fixtures.map(x=>structuredClone(x));
 values[3][0].device_id='not_found';
 const broken=await readHARegistrySnapshot(connection(values));
 assert.equal(broken.status,'unverified');
 assert.equal(broken.reason,'unknown_device_link');
 assert.equal(broken.completed,5);
});
test('bounded timeout and missing connection are fail-closed',async()=>{
 assert.equal((await readHARegistrySnapshot({})).status,'unverified');
 assert.equal((await readHARegistrySnapshot(connection(),{timeoutMs:10})).reason,'invalid_timeout');
 const c={sendMessagePromise:async()=>await new Promise(()=>{})};
 const out=await readHARegistrySnapshot(c,{timeoutMs:500});
 assert.equal(out.reason,'read_failed');
 assert.equal(out.completed,0);
});
