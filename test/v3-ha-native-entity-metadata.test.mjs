import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeNativeHAEntity} from '../src/home/ha-native-entity-metadata.mjs';
const areas={structuredContent:{success:true,floor_count:1,area_count:2,unassigned_count:1,
 floors:[{floor_id:'ground',areas:[{area_id:'hall',name:'Тамбур',floor_id:'ground',aliases:['Прихожая'],labels:[]}]}],
 unassigned_areas:[{area_id:'sauna',name:'Ванная и Сауна',floor_id:null,aliases:[],labels:[]}],orphaned_areas:[]}};
const entity=(changes={})=>({structuredContent:{success:true,entity_entry:{
 entity_id:'light.tambur_svet_l1',area_id:null,area:'Тамбур',device_id:'abcd1234',
 label_names:['Освещение'],labels:[],enabled:true,hidden:false,disabled_by:null,hidden_by:null,...changes
}}});
const args={areaResponse:areas,expectedEntityId:'light.tambur_svet_l1'};
test('native name and label_names classify lighting even when entity labels array is empty',()=>{
 const x=normalizeNativeHAEntity({...args,entityResponse:entity()});
 assert.equal(x.status,'scoped_entity_metadata');
 assert.equal(x.entity.areaId,'hall');
 assert.equal(x.entity.category,'lighting');
 assert.equal(x.entity.categorySource,'ha_mcp_label_names');
 assert.equal(x.authorizesRead,false);
 assert.equal(x.authorizesWrite,false);
 assert.equal(x.entity.authorizedForAction,false);
});
test('resolves aliases and device area fallback, but not unverified names',()=>{
 const a=normalizeNativeHAEntity({...args,entityResponse:entity({area:'Прихожая'})});
 assert.equal(a.entity.areaId,'hall');
 const b=normalizeNativeHAEntity({...args,entityResponse:entity({area:null}),knownDevices:[{device_id:'abcd1234',area_id:'sauna'}]});
 assert.equal(b.entity.areaId,'sauna');
 const c=normalizeNativeHAEntity({...args,entityResponse:entity({area:'Unrecognized'})});
 assert.equal(c.status,'unverified');
});
test('metadata conflict, hidden entities, wrong identity and explicit invalid areas fail closed',()=>{
 assert.equal(normalizeNativeHAEntity({...args,entityResponse:entity({label_names:['Освещение','Системный']})}).entity.category,'ambiguous');
 for(const change of [{entity_id:'light.another'},{hidden:true},{enabled:false},{area_id:'invalid'},{label_names:undefined},{disabled_by:'integration'}]){
  const r=normalizeNativeHAEntity({...args,entityResponse:entity(change)});
  assert.equal(r.status,'unverified');
  assert.equal(r.authorizesWrite,false);
 }
});
test('area labels never become entity label category',()=>{
 const r=normalizeNativeHAEntity({...args,entityResponse:entity({label_names:[]})});
 assert.equal(r.entity.category,'unclassified');
});
