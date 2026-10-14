import test from 'node:test';
import assert from 'node:assert/strict';
import {buildScopedHARoomInventory,summarizeScopedRoomLighting} from '../src/home/ha-scoped-room-inventory.mjs';

const area=(id,name,floor_id)=>({area_id:id,name,floor_id,aliases:[],labels:['lighting']});
const areaResponse=()=>({structuredContent:{
 success:true,floor_count:1,area_count:2,unassigned_count:1,
 floors:[{floor_id:'first',areas:[area('kitchen','Кухня','first')]}],
 unassigned_areas:[area('living','Гостиная',null)],
 orphaned_areas:[]
}});
test('joins entity area overrides and inherited device labels but no new read or write authority',()=>{
 const inventory=buildScopedHARoomInventory({
  areaResponse:areaResponse(),
  deviceRecords:[{id:'device1',area_id:'kitchen',labels:['light_label']}],
  labelRecords:[{label_id:'light_label',name:'Освещение'},{label_id:'system_label',name:'Системный'}],
  entityRecords:[
   {entity_id:'light.kitchen',device_id:'device1'},
   {entity_id:'light.living',device_id:'device1',area_id:'living'},
   {entity_id:'light.unknown',area_id:'kitchen'},
   {entity_id:'sensor.system',area_id:'kitchen',labels:['system_label']}
  ],
  approvedReadIds:['light.kitchen']
 });
 assert.equal(inventory.status,'partial_entity_metadata');
 assert.equal(inventory.coverage.areaTotal,2);
 assert.equal(inventory.coverage.observedEntities,4);
 assert.equal(inventory.registryComplete,false);
 assert.equal(inventory.authorizesRead,false);
 assert.equal(inventory.authorizesWrite,false);
 const kitchen=summarizeScopedRoomLighting(inventory,{area:'Кухня'});
 assert.deepEqual(kitchen.entities,[{
  id:'light.kitchen',readApproved:true,requiresReview:false,actionApproved:false
 }]);
 const living=summarizeScopedRoomLighting(inventory,{area:'Гостиная'});
 assert.equal(living.entities[0].id,'light.living');
 assert.equal(living.entities[0].readApproved,false);
 assert.equal(living.entities[0].actionApproved,false);
 assert.equal(kitchen.partial,true);
 assert.equal(kitchen.authorization,false);
 assert.equal(kitchen.actualWrite,false);
});
test('area labels alone never classify entity lighting',()=>{
 const inv=buildScopedHARoomInventory({
  areaResponse:areaResponse(),entityRecords:[{entity_id:'light.something',area_id:'kitchen'}]
 });
 assert.equal(inv.coverage.classifiedEntities,0);
 assert.equal(summarizeScopedRoomLighting(inv,{area:'Кухня'}).entities.length,0);
});
test('partial discovery never becomes full-registry claim and malformed input fails closed',()=>{
 assert.equal(buildScopedHARoomInventory({areaResponse:areaResponse()}).status,'unverified');
 const duplicate=buildScopedHARoomInventory({
  areaResponse:areaResponse(),entityRecords:[
   {entity_id:'light.one'},{entity_id:'light.one'}]
 });
 assert.equal(duplicate.status,'unverified');
 assert.equal(duplicate.entities.length,0);
 const invalid=buildScopedHARoomInventory({
  areaResponse:{structuredContent:{success:false}},entityRecords:[]
 });
 assert.equal(invalid.status,'unverified');
});
