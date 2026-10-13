import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';
import {REVIEWED_KITCHEN_LIGHTS,summarizeReviewedKitchenLights} from '../src/home/kitchen-light-readonly-status.mjs';

const ids=['light.kukhnia_led_niz_l1','light.kukhnia_led_niz_l2','light.kukhnia_svet','light.led_kukhnia'];

test('pinned-kitchen proposal recognizes bounded questions; mixed/physical requests are not read-intents',()=>{
 for(const q of [
  'Что со светом на кухне?', 'Горит ли свет на кухне?',
  'Какие лампы включены на кухне?', 'Состояние света на кухне?'
 ])assert.equal(classifyReadonlyQuestion(q),'kitchen_review');
 for(const q of [
  'Что со светом на кухне? Выключи всё',
  'Что со светом на кухне и в гостиной?',
  'Что со светом на кухне;turn_on?'
 ])assert.equal(classifyReadonlyQuestion(q),'unsupported_question');
 for(const q of ['Включи свет на кухне','Выключи свет на кухне'])
  assert.notEqual(classifyReadonlyQuestion(q),'kitchen_review');
});

test('kitchen source reads exact four current IDs and reports partial readings without guessing OFF',async()=>{
 assert.deepEqual(REVIEWED_KITCHEN_LIGHTS.map(x=>x.id),ids);
 const calls=[];
 const report=await summarizeReviewedKitchenLights({readState:async id=>{
  calls.push(id);
  return {structuredContent:{data:{entity_id:id,state:id===ids[1]?'unavailable':'off'}}};
 }});
 assert.deepEqual(calls,ids);
 assert.equal(report.status,'partial');
 assert.deepEqual(report.counts,{on:0,off:3,unknown:1});
 assert.equal(report.authorization,false);
 assert.equal(report.actualWrite,false);
 assert.match(report.text,/из 4 выбранных сущностей/);
 assert.match(report.text,/НЕ весь свет кухни/);
 assert.match(report.text,/Идентичность устройств пока не подтверждена/);
});

test('fake HA responses cannot change exact scope or leak exceptions',async()=>{
 let n=0;
 const r=await summarizeReviewedKitchenLights({readState:async id=>{
  n++;
  if(n===1)return {data:{entity_id:id,state:'on'}};
  if(n===2)return {data:{entity_id:'light.different',state:'off'}};
  if(n===3)throw Error('PRIVATE_TOKEN_DO_NOT_SHOW');
  return {isError:true,data:{entity_id:id,state:'off'}};
 }});
 assert.equal(r.status,'partial');
 assert.deepEqual(r.counts,{on:1,off:0,unknown:3});
 assert.equal(r.actualWrite,false);
 assert.doesNotMatch(r.text,/PRIVATE_TOKEN/);
 assert.match(r.text,/ID ответа не совпал/);
});

test('pinned pilot retains original consent/actor and Telegram poller, kitchen branch is read-only',()=>{
 const src=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 const gate="const allow=ctx=>ctx.chat?.type==='private'&&ctx.chat?.id===userId&&ctx.from?.id===userId;";
 const conf="const result=await pilot.confirm(actor(ctx));";
 const expected="if(intent==='kitchen_review')return summarizeReviewedKitchenLights({readState:id=>saunaRead('ha_get_state',{entity_id:id})}).then(result=>ctx.reply(result.text));";
 assert.ok(src.includes(gate));
 assert.ok(src.includes(conf));
 assert.ok(src.includes(expected));
 assert.equal((src.match(/bot\.launch\(/g)||[]).length,1);
 assert.ok(src.indexOf("if(!allow(ctx))return;")<src.indexOf(expected));
 assert.ok(src.indexOf(expected)<src.indexOf("const r=pilot.request(actor(ctx),ctx.message?.text);"));
 assert.doesNotMatch(expected,/ha_call_service|\.dispatch\(|\.confirm\(/);
 assert.doesNotMatch(src,/createNewLightDispatch|pendingNewLights|newLightConsent/);
});
