import test from 'node:test';
import assert from 'node:assert/strict';
import {HA_REGISTRY_READ_COMMANDS,normalizeHAWebSocketSnapshot,validateHAWebSocketResults} from '../src/home/ha-ws-registry-snapshot.mjs';
const fixture=()=>({
 floors:[{floor_id:'ground',name:'Ground'}],
 areas:[{area_id:'kitchen',floor_id:'ground',labels:['control'],name:'Kitchen'},
  {area_id:'sauna',floor_id:null,labels:[]}],
 devices:[{id:'abc1234',area_id:'kitchen',labels:['light'],disabled_by:null},
  {id:'def5678',area_id:null,labels:[]}],
 entities:[
  {entity_id:'light.kitchen',device_id:'abc1234',area_id:null,labels:['light'],disabled_by:null,hidden_by:null},
  {entity_id:'light.sauna',device_id:'abc1234',area_id:'sauna',labels:[],disabled_by:null,hidden_by:'user'},
  {entity_id:'sensor.helper',device_id:null,area_id:null,labels:[],disabled_by:'integration',hidden_by:null}
 ],
 labels:[{label_id:'light',name:'Освещение'},{label_id:'control',name:'Управление'}]
});
test('native registry command allowlist consists of exactly five read-list operations',()=>{
 assert.deepEqual(HA_REGISTRY_READ_COMMANDS,[
 'config/floor_registry/list','config/area_registry/list','config/device_registry/list',
 'config/entity_registry/list','config/label_registry/list'
 ]);
 assert.ok(HA_REGISTRY_READ_COMMANDS.every(x=>x.endsWith('/list')));
});
test('complete offline fixture resolves entity/device/area/floor and separate label sources',()=>{
 const normalized=normalizeHAWebSocketSnapshot(fixture());
 assert.equal(normalized.status,'offline_snapshot_normalized');
 assert.equal(normalized.complete,true);
 assert.deepEqual(normalized.counts,{
  floors:1,areas:2,devices:2,entities:3,labels:2,
  unassignedEntities:1,unassignedDevices:1,disabledEntities:1,hiddenEntities:1
 });
 assert.deepEqual(normalized.entities[0].labelsBySource,
  {entity:['light'],device:['light'],area:['control']});
 assert.equal(normalized.entities[0].floorId,'ground');
 assert.equal(normalized.entities[1].areaId,'sauna');
 assert.equal(normalized.entities[1].floorId,null);
 assert.equal(normalized.entities[1].hidden,true);
 assert.equal(normalized.entities[2].deviceId,null);
 assert.equal(normalized.entities[2].enabled,false);
 assert.equal(normalized.authorizesRead,false);
 assert.equal(normalized.authorizesWrite,false);
 assert.ok(normalized.entities.every(x=>!x.readApproved&&!x.actionApproved));
});
test('no registry completeness claim for failed, missing or display-only responses',()=>{
 const all=fixture();
 const responses=Object.fromEntries(Object.entries(all).map(([k,v])=>[k,{success:true,result:v}]));
 assert.equal(validateHAWebSocketResults(responses).status,'offline_snapshot_normalized');
 responses.entities={success:true,result:{entities:[{ei:'light.kitchen'}]}};
 assert.equal(validateHAWebSocketResults(responses).status,'unverified');
 responses.entities={success:false,result:[]};
 assert.equal(validateHAWebSocketResults(responses).complete,false);
});
test('duplicate and dangling links fail closed, not silently unassigned',()=>{
 const cases=[];
 let x=fixture();x.entities.push({...x.entities[0]});cases.push(x);
 x=fixture();x.entities[0].device_id='missing';cases.push(x);
 x=fixture();x.entities[0].area_id='unknown';cases.push(x);
 x=fixture();x.areas[0].floor_id='bad';cases.push(x);
 x=fixture();x.entities[0].labels=['unknown'];cases.push(x);
 x=fixture();x.devices[0].labels=['unknown'];cases.push(x);
 x=fixture();x.areas[0].labels=['unknown'];cases.push(x);
 for(const item of cases){
  const n=normalizeHAWebSocketSnapshot(item);
  assert.equal(n.status,'unverified');
  assert.equal(n.authorizesRead,false);
  assert.equal(n.authorizesWrite,false);
 }
});
