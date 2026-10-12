import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_LIGHT_CANDIDATES} from '../src/home/new-light-candidates.mjs';
import {summarizeNewLightsByArea} from '../src/home/new-light-area-summary.mjs';

const snapshot=NEW_LIGHT_CANDIDATES.map((x,i)=>({
 id:x.id,area:x.area,state:i===12?'on':i<10?'unknown':'off'
}));
test('room lighting is bounded, distinguishes unknown from off and never grants actions',()=>{
 const r=summarizeNewLightsByArea({authorization:false,actualWrite:false,entries:snapshot});
 assert.equal(r.status,'partial');
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.ok(r.text.includes('не весь свет дома'));
 assert.ok(r.areas.find(x=>x.area==='Кухня').unknown>0);
 assert.ok(r.areas.find(x=>x.area==='Гостиная').on>0);
 assert.equal(r.areas.reduce((n,x)=>n+x.on+x.off+x.unknown,0),19);
});
test('invalid identities, reordered and unauthorized source results fail closed',()=>{
 for(const entry of [
  {authorization:true,actualWrite:false,entries:snapshot},
  {authorization:false,actualWrite:true,entries:snapshot},
  {authorization:false,actualWrite:false,entries:snapshot.slice(1)},
  {authorization:false,actualWrite:false,entries:snapshot.map((x,i)=>i===0?{...x,id:'light.browser_mod_fake'}:x)},
  {authorization:false,actualWrite:false,entries:snapshot.map((x,i)=>i===0?{...x,state:'unavailable'}:x)}
 ]){
  const r=summarizeNewLightsByArea(entry);
  assert.equal(r.status,'invalid');assert.deepEqual(r.areas,[]);
 }
});
