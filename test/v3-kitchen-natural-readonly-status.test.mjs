import test from 'node:test';
import assert from 'node:assert/strict';
import {REVIEWED_KITCHEN_LIGHTS,summarizeReviewedKitchenLights} from '../src/home/kitchen-light-readonly-status.mjs';

const expectedIds=[
 'light.kukhnia_led_niz_l1','light.kukhnia_led_niz_l2',
 'light.kukhnia_svet','light.led_kukhnia'
];

test('natural kitchen read checks exactly four owner-observed primary entities, never stale wrappers',async()=>{
 const calls=[];
 const r=await summarizeReviewedKitchenLights({readState:async entity_id=>{
  calls.push(entity_id);
  return {structuredContent:{data:{entity_id,state:entity_id==='light.kukhnia_svet'?'on':'off'}}};
 }});
 assert.deepEqual(REVIEWED_KITCHEN_LIGHTS.map(item=>item.id),expectedIds);
 assert.deepEqual(calls,expectedIds);
 assert.equal(new Set(calls).size,4);
 assert.ok(calls.every(id=>id.startsWith('light.')&&!id.includes('browser_mod')));
 for(const stale of ['light.kukhnia_led_niz_l1_2','light.kukhnia_led_niz_l2_2','light.kukhnia_svet_3','light.podsvetka_kukhnia'])
  assert.equal(calls.includes(stale),false);
 assert.equal(r.status,'complete');
 assert.deepEqual(r.counts,{on:1,off:3,unknown:0});
 assert.equal(r.authorization,false);
 assert.equal(r.actualWrite,false);
 assert.match(r.text,/из 4 выбранных сущностей/);
 assert.match(r.text,/light\.kukhnia_svet/);
 assert.match(r.text,/НЕ весь свет кухни/);
 assert.match(r.text,/Идентичность устройств пока не подтверждена/);
});

test('unavailable, identity mismatch, read and MCP errors remain unknown, never OFF',async()=>{
 let calls=0;
 const r=await summarizeReviewedKitchenLights({readState:async id=>{
  calls++;
  if(calls===1)return {structuredContent:{data:{entity_id:id,state:'unavailable'}}};
  if(calls===2)return {data:{entity_id:'light.other',state:'off'}};
  if(calls===3)throw Error('secret_token_should_never_leak');
  return {isError:true,data:{entity_id:id,state:'off'}};
 }});
 assert.equal(calls,4);
 assert.equal(r.status,'partial');
 assert.deepEqual(r.counts,{on:0,off:0,unknown:4});
 assert.deepEqual(r.unknownReasons.map(item=>item.reason),[
  'unavailable','identity_mismatch','read_error','mcp_error'
 ]);
 assert.match(r.text,/light\.kukhnia_led_niz_l1 \(недоступна в HA\)/);
 assert.match(r.text,/ID ответа не совпал/);
 assert.match(r.text,/ошибка MCP/);
 assert.doesNotMatch(r.text,/secret_token/);
 assert.equal(r.authorization,false);
 assert.equal(r.actualWrite,false);
});

test('partial kitchen result keeps three verified OFF independent of one unknown',async()=>{
 const result=await summarizeReviewedKitchenLights({readState:async id=>({
  data:{entity_id:id,state:id==='light.kukhnia_led_niz_l2'?'unavailable':'off'}
 })});
 assert.equal(result.status,'partial');
 assert.deepEqual(result.counts,{on:0,off:3,unknown:1});
 assert.match(result.text,/light\.kukhnia_led_niz_l2 \(недоступна в HA\)/);
 assert.equal(result.authorization,false);
 assert.equal(result.actualWrite,false);
});

test('missing reader fails closed without HA writes or state guesses',async()=>{
 const r=await summarizeReviewedKitchenLights();
 assert.equal(r.status,'unavailable');
 assert.equal(r.actualWrite,false);
 assert.match(r.text,/Состояние неизвестно/);
});
