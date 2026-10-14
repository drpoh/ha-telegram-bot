import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectNativeEntry} from '../src/home/ha-native-entry-adapter.mjs';
const areas=[{area_id:'bathroom',name:'Ванная и Сауна',aliases:['Сауна']},{area_id:'kitchen',name:'Кухня'}];
const devices=[{device_id:'dev1',area_id:'bathroom'}];
const labels=[{label_id:'light_label',name:'Освещение'},{label_id:'system_label',name:'Системный'}];
const reply=(changes={})=>({structuredContent:{success:true,entity_id:'light.test',
 entity_entry:{entity_id:'light.test',area_id:null,device_id:'dev1',enabled:true,
 hidden:false,labels:[],label_names:['Освещение'],...changes}}});
test('real observed label_names classifies even when labels array empty; device area inherited',()=>{
 const value=inspectNativeEntry(reply(),{entityId:'light.test',areas,devices,labels});
 assert.equal(value.status,'scoped');
 assert.equal(value.areaId,'bathroom');
 assert.equal(value.areaSource,'device');
 assert.equal(value.category,'lighting');
 assert.equal(value.readApproved,false);
 assert.equal(value.actionApproved,false);
 assert.equal(value.completeRegistry,false);
});
test('entity area overrides device and label ID resolves to category',()=>{
 const value=inspectNativeEntry(reply({area_id:'kitchen',labels:['system_label'],label_names:[]}),
 {entityId:'light.test',areas,devices,labels});
 assert.equal(value.areaName,'Кухня');
 assert.equal(value.areaSource,'entity');
 assert.equal(value.category,'system');
});
test('conflicting label categories stay ambiguous, unknown label IDs stay unclassified',()=>{
 const ctx={entityId:'light.test',areas,devices,labels};
 assert.equal(inspectNativeEntry(reply({labels:['system_label']}),ctx).category,'ambiguous');
 assert.equal(inspectNativeEntry(reply({labels:['missing']}),ctx).category,'unclassified');
});
test('unknown identity, invalid area, or disabled/hidden entity is rejected',()=>{
 const ctx={entityId:'light.test',areas,devices,labels};
 assert.equal(inspectNativeEntry(reply(),{...ctx,entityId:'light.other'}).status,'unverified');
 assert.equal(inspectNativeEntry(reply({area_id:'unknown'}),ctx).status,'unverified');
 assert.equal(inspectNativeEntry(reply({enabled:false}),ctx).status,'unverified');
 assert.equal(inspectNativeEntry(reply({hidden:true}),ctx).status,'unverified');
 assert.equal(inspectNativeEntry(reply({disabled_by:'user'}),ctx).status,'unverified');
});
test('unique area name fallback works, area labels do not grant device classification',()=>{
 const ctx={entityId:'light.test',areas,devices:[],labels};
 assert.equal(inspectNativeEntry(reply({area:'Сауна',device_id:null,labels:[],label_names:[]}),ctx).areaId,'bathroom');
 assert.equal(inspectNativeEntry(reply({area:'Сауна',device_id:null,labels:[],label_names:[]}),ctx).category,'unclassified');
});
