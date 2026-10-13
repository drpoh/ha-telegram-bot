import test from 'node:test';
import assert from 'node:assert/strict';
import {REVIEWED_KITCHEN_LIGHTS,summarizeReviewedKitchenLights} from '../src/home/kitchen-light-readonly-status.mjs';

test('kitchen natural response reads only fixed seven reviewed kitchen IDs',async()=>{
 const calls=[];
 const r=await summarizeReviewedKitchenLights({readState:async entity_id=>{
  calls.push(entity_id);
  return {structuredContent:{data:{entity_id,state:entity_id==='light.kukhnia_svet'?'on':'off'}}};
 }});
 assert.equal(REVIEWED_KITCHEN_LIGHTS.length,7);
 assert.deepEqual(calls,REVIEWED_KITCHEN_LIGHTS.map(e=>e.id));
 assert.equal(new Set(calls).size,7);
 assert.ok(calls.every(id=>id.startsWith('light.')&&!id.startsWith('light.browser_mod')));
 assert.equal(r.status,'complete');
 assert.deepEqual(r.counts,{on:1,off:6,unknown:0});
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.match(r.text,/light\.kukhnia_svet/);
 assert.match(r.text,/НЕ весь свет кухни/);
 assert.match(r.text,/Идентичность устройств пока не подтверждена/);
});
test('missing, mismatched, unavailable, and MCP failure remain unknown rather than OFF',async()=>{
 let calls=0;
 const r=await summarizeReviewedKitchenLights({readState:async id=>{
  calls++;
  if(calls===1)return {structuredContent:{data:{entity_id:id,state:'unavailable'}}};
  if(calls===2)return {data:{entity_id:'light.other',state:'off'}};
  if(calls===3)throw Error('secret_token_should_never_leak');
  if(calls===4)return {isError:true,data:{entity_id:id,state:'off'}};
  return {data:{entity_id:id,state:'off'}};
 }});
 assert.equal(calls,7);assert.equal(r.status,'partial');
 assert.deepEqual(r.counts,{on:0,off:3,unknown:4});
 assert.match(r.text,/неизвестно или недоступно 4/);
 assert.doesNotMatch(r.text,/secret_token/);
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});
test('without reader, fail closed and do not claim room status',async()=>{
 const r=await summarizeReviewedKitchenLights();
 assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);
 assert.match(r.text,/Состояние неизвестно/);
});
