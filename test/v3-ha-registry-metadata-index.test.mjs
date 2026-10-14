import test from 'node:test';
import assert from 'node:assert/strict';
import {buildHAReadOnlyMetadataIndex,selectHAAreaEntities,proposeReadOnlyEntityIds} from '../src/home/ha-registry-metadata-index.mjs';

const sample=()=>({
 areas:[{area_id:'kitchen',name:'Кухня',aliases:['кухонная зона']},{area_id:'living',name:'Гостиная'}],
 devices:[{id:'d_kitchen',area_id:'kitchen',labels:['label_light']},{id:'d_living',area_id:'living',labels:[]}],
 labels:[{label_id:'label_light',name:'Освещение'},{label_id:'label_control',name:'Управление'},{label_id:'label_system',name:'Системный'}],
 entities:[
  {entity_id:'light.kitchen',device_id:'d_kitchen'},
  {ei:'light.living',di:'d_living',ai:'living',lb:['label_light']},
  {entity_id:'light.special',device_id:'d_kitchen',area_id:'living',labels:['label_light']},
  {entity_id:'switch.control',area_id:'kitchen',labels:['label_control']},
  {entity_id:'sensor.internal',area_id:'kitchen',labels:['label_system']},
  {entity_id:'light.unknown',area_id:'kitchen'},
  {entity_id:'light.conflict',area_id:'kitchen',labels:['label_light','label_system']},
  {entity_id:'light.hidden',area_id:'kitchen',labels:['label_light'],hidden_by:'user'},
  {entity_id:'light.disabled',area_id:'kitchen',labels:['label_light'],disabled_by:'integration'},
  {entity_id:'light.no_area',labels:['label_light']},
  {entity_id:'light.browser_mod_private',area_id:'kitchen',labels:['label_light']}
 ]
});
test('HA registry metadata derives entity-over-device area and inherited labels without authorization',()=>{
 const index=buildHAReadOnlyMetadataIndex(sample());
 assert.equal(index.find(e=>e.entityId==='light.kitchen').areaName,'Кухня');
 assert.equal(index.find(e=>e.entityId==='light.kitchen').category,'lighting');
 assert.equal(index.find(e=>e.entityId==='light.special').areaName,'Гостиная');
 assert.equal(index.find(e=>e.entityId==='light.conflict').category,'ambiguous');
 assert.equal(index.find(e=>e.entityId==='light.unknown').category,'unclassified');
 assert.equal(index.find(e=>e.entityId==='light.no_area').visibleInRoom,false);
 assert.equal(index.find(e=>e.entityId==='light.hidden'),undefined);
 assert.equal(index.find(e=>e.entityId==='light.disabled'),undefined);
 const kitchen=selectHAAreaEntities(index,{area:'кухонная зона'});
 assert.ok(kitchen.some(e=>e.entityId==='light.kitchen'));
 assert.ok(!kitchen.some(e=>e.entityId==='light.special'));
 assert.ok(!kitchen.some(e=>e.entityId==='sensor.internal'));
 const control=selectHAAreaEntities(index,{area:'Кухня',category:'control'});
 assert.deepEqual(control.map(x=>x.entityId),['switch.control']);
});
test('metadata remains a proposal; no unseen candidate receives approval',()=>{
 const index=buildHAReadOnlyMetadataIndex(sample());
 const rows=proposeReadOnlyEntityIds(index,{
  area:'кухня',approvedReadIds:['light.kitchen']
 });
 assert.equal(rows.find(x=>x.id==='light.kitchen').readApproved,true);
 assert.equal(rows.some(x=>x.id==='light.browser_mod_private'),false);
 assert.equal(rows.some(x=>x.id==='light.unknown'),false);
 assert.equal(rows.some(x=>x.id==='light.conflict'),false);
 assert.deepEqual(proposeReadOnlyEntityIds(index,{area:'no-such-room'}),[]);
});
test('missing, malformed and ambiguous registry metadata fails conservatively',()=>{
 assert.throws(()=>buildHAReadOnlyMetadataIndex({areas:[],devices:[],labels:[]}),/invalid_registry_snapshot/);
 const index=buildHAReadOnlyMetadataIndex({
  areas:[{area_id:'kitchen',name:'Кухня'}],devices:[],labels:[],
  entities:[{ei:'light.test',ai:'kitchen',lb:['missing_label']},{ei:'light.x',ai:'unknown',lb:[]},{ei:'bad id'}]
 });
 assert.equal(index.length,2);
 assert.equal(index[0].category,'unclassified');
 assert.equal(index[1].areaId,null);
});
