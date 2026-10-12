import test from "node:test";
import assert from "node:assert/strict";
import {normalizeLightingRegistry,verifyLightingRegistryDigest} from "../src/decision/v3-registry-drift-check.mjs";
const base=()=>({entities:[{entity_id:"light.ves_svet",platform:"group",area_id:"dom"},{entity_id:"light.koridor_2",platform:"yandex_station",device_id:"d1",original_name:"Коридор"},{entity_id:"light.fake_screen",platform:"browser_mod"}],devices:[{id:"d1",area_id:"koridor"}],areas:[{id:"dom"},{id:"koridor"}],groupMembers:["light.koridor_2"]});
test("normalized evidence is stable and never a grant",()=>{
 const b=base(),a=normalizeLightingRegistry(b);
 assert.equal(a.ok,true);assert.equal(a.authorization,false);
 assert.equal(a.binding.records.find(x=>x.id==="light.koridor_2").area,"koridor");
 assert.equal(verifyLightingRegistryDigest(a,a.sha256).valid,true);
 assert.equal(verifyLightingRegistryDigest(a,a.sha256).authorization,false);
 assert.equal(normalizeLightingRegistry({...b,entities:[...b.entities].reverse()}).sha256,a.sha256);
});
test("renaming, moving, disabling, removing pseudo-lights and member changes invalidate snapshot",()=>{
 const b=base(),original=normalizeLightingRegistry(b);
 const variants=[
 {...b,entities:b.entities.map(x=>x.entity_id==="light.koridor_2"?{...x,name:"Подсветка"}:x)},
 {...b,devices:[{id:"d1",area_id:"dom"}]},
 {...b,entities:b.entities.map(x=>x.entity_id==="light.koridor_2"?{...x,disabled_by:"user"}:x)},
 {...b,entities:b.entities.filter(x=>x.entity_id!=="light.fake_screen")},
 {...b,groupMembers:["light.fake_screen"]}
 ];
 for(const v of variants)assert.equal(verifyLightingRegistryDigest(normalizeLightingRegistry(v),original.sha256).reason,"registry_changed");
});
test("incomplete, duplicate, unknown devices and wrong group fail closed",()=>{
 const b=base();
 assert.equal(normalizeLightingRegistry({...b,groupMembers:null}).ok,false);
 assert.equal(normalizeLightingRegistry({...b,groupMembers:["light.koridor_2","light.koridor_2"]}).ok,false);
 assert.equal(normalizeLightingRegistry({...b,entities:[...b.entities,b.entities[0]]}).ok,false);
 assert.equal(normalizeLightingRegistry({...b,devices:[]}).ok,false);
 assert.equal(normalizeLightingRegistry({...b,entities:b.entities.map(x=>x.entity_id==="light.ves_svet"?{...x,platform:"yandex_station"}:x)}).ok,false);
});


test('duplicate and missing device or area identities fail closed',()=>{
 const base={entities:[{entity_id:'light.ves_svet',platform:'group'}],
  devices:[{id:'device-1',area_id:'area-1'}],areas:[{id:'area-1'}],
  groupMembers:['light.fixture']};
 for(const devices of [[{id:'duplicate'},{id:'duplicate'}],[{id:''}],[{}]]){
  assert.equal(normalizeLightingRegistry({...base,devices}).ok,false);
 }
 for(const areas of [[{id:'duplicate'},{id:'duplicate'}],[{id:''}],[{}]]){
  assert.equal(normalizeLightingRegistry({...base,areas}).ok,false);
 }
 assert.equal(normalizeLightingRegistry(base).ok,true);
});
