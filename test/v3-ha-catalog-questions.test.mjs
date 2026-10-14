import test from 'node:test';
import assert from 'node:assert/strict';
import {answerHARegistryQuestion} from '../src/home/ha-catalog-questions.mjs';
import {normalizeHAWebSocketSnapshot} from '../src/home/ha-ws-registry-snapshot.mjs';
const source={floors:[{floor_id:'f2',name:'Второй этаж'}],
 areas:[{area_id:'kitchen',name:'Кухня',floor_id:'f2'},{area_id:'hall',name:'Коридор',floor_id:null}],
 devices:[{id:'d1',name:'Термостат',area_id:'kitchen',labels:[]}],
 entities:[{entity_id:'climate.thermostat',device_id:'d1',area_id:null,labels:[]},
 {entity_id:'light.one',device_id:null,area_id:'hall',labels:[]},
 {entity_id:'light.two',device_id:null,area_id:'hall',disabled_by:'user',labels:[]},
 {entity_id:'sensor.orphan',device_id:null,area_id:null,labels:[]}],labels:[]};
const normalized=normalizeHAWebSocketSnapshot(source);
const catalog={...normalized,status:'validated_snapshot'};
const session={getVerifiedCatalog:()=>catalog};
test('preserves registry names and no authority',()=>{
 assert.equal(normalized.areas[0].name,'Кухня');
 assert.equal(normalized.devices[0].name,'Термостат');
 assert.equal(normalized.authorizesWrite,false);
});
test('answers scoped room and light queries without physical count inference',()=>{
 const a=answerHARegistryQuestion(session,'Какие устройства есть в Кухня?');
 assert.equal(a.status,'answered');
 assert.match(a.text,/1 записей устройств HA/);
 assert.match(a.text,/1 записей сущностей/);
 const b=answerHARegistryQuestion(session,'Сколько светильников в Коридор?');
 assert.match(b.text,/2 сущностей light/);
 assert.match(b.text,/Количество физических светильников неизвестно/);
});
test('unassigned, disabled, exact entity, and floor reads remain metadata-only',()=>{
 assert.match(answerHARegistryQuestion(session,'Что не распределено по комнатам?').text,/1 записей/);
 assert.match(answerHARegistryQuestion(session,'Какие устройства отключены?').text,/1 записей сущностей/);
 assert.match(answerHARegistryQuestion(session,'Где climate.thermostat?').text,/Кухня/);
 assert.match(answerHARegistryQuestion(session,'Что на втором этаже?').text,/1 сущностей/);
});
test('stale and ambiguous requests fail closed',()=>{
 assert.equal(answerHARegistryQuestion({getVerifiedCatalog:()=>null},'Какие устройства есть в Кухня?').status,'unverified');
 assert.equal(answerHARegistryQuestion(session,'Где термостат?').reason,'exact_entity_id_required');
 assert.equal(answerHARegistryQuestion(session,'Включи свет в Кухня').status,'unverified');
 assert.equal(answerHARegistryQuestion(session,'Какие устройства есть в Кухня и Коридор?').reason,'ambiguous_area');
});
