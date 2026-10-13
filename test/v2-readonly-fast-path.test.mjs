import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerV2ReadonlyFastPath,createExactV2ReadonlyReader} from '../src/telegram/readonly-fast-path.mjs';
import {LIGHT_OVERVIEW_IDS} from '../src/home/light-overview.mjs';
import {REVIEWED_KITCHEN_LIGHTS} from '../src/home/kitchen-light-readonly-status.mjs';

const states=(seen,values={})=>async id=>{
 seen.push(id);
 return {structuredContent:{data:{entity_id:id,state:values[id]??'off'}}};
};

test('owner kitchen read-only questions use exactly four current HA entities, not AI or legacy wrappers',async()=>{
 const expected=REVIEWED_KITCHEN_LIGHTS.map(x=>x.id);
 assert.deepEqual(expected,[
  'light.kukhnia_led_niz_l1','light.kukhnia_led_niz_l2',
  'light.kukhnia_svet','light.led_kukhnia'
 ]);
 for(const text of ['Что со светом на кухне?', 'Какой свет на кухне?', 'Состояние света на кухне?']){
  const seen=[];
  const r=await answerV2ReadonlyFastPath({
   text,readState:states(seen,{'light.kukhnia_svet':'on'})
  });
  assert.deepEqual(seen,expected);
  assert.equal(r.handled,true);
  assert.equal(r.status,'complete');
  assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);
  assert.match(r.text,/из 4 выбранных сущностей/);
  assert.match(r.text,/включено 1, выключено 3, неизвестно или недоступно 0/);
 }
});

test('sauna, tambour and four-light overview reuse V3 proven read-only summarizers',async()=>{
 const saunaCalls=[];
 const sauna=await answerV2ReadonlyFastPath({
  text:'Сколько градусов в сауне?',
  readState:states(saunaCalls,{'sensor.sauna_te_sauna_temperature':'80.5'})
 });
 assert.deepEqual(saunaCalls,['sensor.sauna_te_sauna_temperature','binary_sensor.sauna_sauna_te_sauna_ready']);
 assert.equal(sauna.text,'Температура сауны: 80.5 °C.');
 assert.equal(sauna.actualWrite,false);
 const tambourCalls=[];
 const tambour=await answerV2ReadonlyFastPath({text:'Горит ли свет в тамбуре?',readState:states(tambourCalls,{'light.tambur_svet_l1':'off'})});
 assert.deepEqual(tambourCalls,['light.tambur_svet_l1']);
 assert.equal(tambour.text,'Нет, свет в тамбуре выключен.');
 const overviewCalls=[];
 const overview=await answerV2ReadonlyFastPath({text:'Где горит свет?',readState:states(overviewCalls,{'light.tambur_svet_l1':'on'})});
 assert.deepEqual(overviewCalls,LIGHT_OVERVIEW_IDS);
 assert.equal(overview.status,'complete');assert.equal(overview.actualWrite,false);
});

test('unrelated questions, incomplete scope and physical instructions remain in original V2 AI/policy route',async()=>{
 const seen=[],reader=async id=>{seen.push(id);throw Error('should not read');};
 for(const text of [
  'Где мой телефон?', 'Сколько осталось до нагрева сауны?',
  'Свет на кухне и в гостиной?', 'Что со светом на кухне и в гостиной?',
  'Какой свет на кухне;switch.vannaia_svet?',
  'Включи свет на кухне', 'Выключи свет в тамбуре',
  'Покорми кота', 'Да', '', null
 ]){
  assert.deepEqual(await answerV2ReadonlyFastPath({text,readState:reader}),
   {handled:false,authorization:false,actualWrite:false});
 }
 assert.deepEqual(seen,[]);
});

test('MCP errors and unavailable entities never invent OFF and never leak connection details',async()=>{
 const secret='secret_mcp_endpoint_token_123';
 const r=await answerV2ReadonlyFastPath({
  text:'Какие лампы включены на кухне?',
  readState:async()=>{throw Error(secret);}
 });
 assert.equal(r.handled,true);assert.equal(r.status,'partial');
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.match(r.text,/неизвестно или недоступно 4/);
 assert.doesNotMatch(r.text,/выключено 4/);
 assert.doesNotMatch(r.text,new RegExp(secret));
 const mismatched=await answerV2ReadonlyFastPath({
  text:'Что со светом в тамбуре?',
  readState:async()=>({data:{entity_id:'light.not_tambour',state:'on'}})
 });
 assert.equal(mismatched.status,'unavailable');
 assert.match(mismatched.text,/Не удалось достоверно/);
});

test('exact V2 MCP adapter allows only ha_get_state of static review IDs, no discovery or service calls',async()=>{
 let clientAccess=0;
 const calls=[];
 const reader=createExactV2ReadonlyReader({getClient:()=>{
  clientAccess++;
  return {callTool:async call=>{
   calls.push(call);
   return {structuredContent:{data:{entity_id:call.arguments.entity_id,state:'off'}}};
  }};
 }});
 for(const id of ['light.browser_mod_unknown_screen','light.ves_svet','light.svet_kukhni','light.sonoff_1000d78a79','switch.vannaia_svet','light.unknown',undefined]){
  await assert.rejects(()=>reader(id),/read_scope_denied/);
 }
 assert.equal(clientAccess,0);
 const reviewed=['light.kukhnia_svet','light.kukhnia_led_niz_l2','light.koridor','light.tambur_svet_l1','sensor.sauna_te_sauna_temperature'];
 for(const id of reviewed){
  const result=await reader(id);
  assert.equal(result.structuredContent.data.entity_id,id);
 }
 assert.equal(clientAccess,reviewed.length);
 assert.deepEqual(calls,reviewed.map(entity_id=>({name:'ha_get_state',arguments:{entity_id}})));
 assert.equal(calls.every(c=>c.name==='ha_get_state'),true);
});

test('V2 Telegram opt-in is private-only, existing queue serializes shortcuts and confirmations',()=>{
 const bot=readFileSync(new URL('../src/telegram/bot.mjs',import.meta.url),'utf8');
 const queue=readFileSync(new URL('../src/utils/queue.mjs',import.meta.url),'utf8');
 const fast=readFileSync(new URL('../src/telegram/readonly-fast-path.mjs',import.meta.url),'utf8');
 assert.match(bot,/readonlyFastPath: ctx\.chat\?\.type === "private" && ctx\.chat\?\.id === ctx\.from\?\.id/);
 assert.match(queue,/new PQueue\(\{concurrency: 1\}\)/);
 assert.match(queue,/if\(readonlyFastPath===true\)/);
 assert.match(queue,/answerV2ReadonlyFastPath\(\{text:userText\}\)/);
 assert.match(queue,/return askHomeAssistant\(userText, agentOptions\)/);
 assert.match(queue,/queueConfirmedAction\(/);
 assert.doesNotMatch(fast,/ha_call_service|\bturn_on\b|\bturn_off\b|\.dispatch\(/);
});
