import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_LIGHT_CANDIDATES} from '../src/home/new-light-candidates.mjs';
import {summarizeNewLightAreaQuery} from '../src/home/new-light-area-query.mjs';

const inspection={authorization:false,actualWrite:false,entries:NEW_LIGHT_CANDIDATES.map((x,i)=>({
 id:x.id,area:x.area,state:i===12?'on':i%2?'unknown':'off'
}))};
test('exact supported room aliases produce read-only scoped statements',()=>{
 for(const area of ['кухня','кухне','гостиная','гостиной','сауна','сауне','ванная','ванной','тамбур','тамбуре','спальня','коридор']){
  const r=summarizeNewLightAreaQuery({inspection,area});
  assert.ok(['complete','partial'].includes(r.status),area);
  assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
  assert.match(r.text,/только выбранные новые сущности HA/);
 }
});
test('unrecognized and malicious area text does not broaden scope',()=>{
 for(const area of ['весь дом','browser_mod','включи кухню','кухня;switch.voda_glavnyi_kran',null]){
  const r=summarizeNewLightAreaQuery({inspection,area});
  assert.equal(r.status,'unsupported');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});
test('invalid raw identity or forbidden authorization is never summarized',()=>{
 const bad={...inspection,entries:inspection.entries.map((x,i)=>i===0?{...x,id:'light.browser_mod_fake'}:x)};
 for(const value of [bad,{...inspection,authorization:true},undefined]){
  const r=summarizeNewLightAreaQuery({inspection:value,area:'кухня'});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});
