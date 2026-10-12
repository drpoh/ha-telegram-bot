import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveStrictArea as resolve} from '../src/home/strict-area-resolver.mjs';
const areas=[{area_id:'sauna',name:'Ванная и Сауна'},{area_id:'koridor',name:'Коридор'},{area_id:'koridor_1_etazh',name:'коридор 1 этаж'},{area_id:'kukhnia',name:'Кухня'}];
test('exact HA name and area ID resolve',()=>{
 assert.equal(resolve({query:'Ванная и Сауна',areas}).area.area_id,'sauna');
 assert.equal(resolve({query:'KUKHNIA',areas}).area.area_id,'kukhnia');
});
test('unreviewed bathroom and sauna subareas do not expand shared area',()=>{
 for(const query of ['Ванная','Сауна','в ванной','в сауне']) {
  assert.equal(resolve({query,areas}).ok,false,query);
 }
});
test('whole sentences are not arbitrary substring matched',()=>assert.equal(resolve({query:'выключи свет в кухне и коридоре',areas}).ok,false));
test('corridors cannot collapse into each other',()=>{
 assert.equal(resolve({query:'коридор',areas}).area.area_id,'koridor');
 assert.equal(resolve({query:'коридор 1 этаж',areas}).area.area_id,'koridor_1_etazh');
});
test('explicit reviewed alias maps exactly',()=>{
 assert.equal(resolve({query:'кухня второго этажа',areas,aliases:{'кухня второго этажа':'kukhnia'}}).area.area_id,'kukhnia');
});
test('alias cannot target absent area',()=>assert.equal(resolve({query:'кухня второго этажа',areas,aliases:{'кухня второго этажа':'missing'}}).ok,false));
test('duplicate area identity blocks',()=>assert.equal(resolve({query:'koridor',areas:[...areas,areas[0]]}).status,'invalid_area_registry'));
