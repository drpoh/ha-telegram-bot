import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {routeV3ReadonlyQuestion} from '../src/pilot/v3-readonly-question-router.mjs';
import {LIGHT_OVERVIEW_IDS} from '../src/home/light-overview.mjs';
import {REVIEWED_KITCHEN_LIGHTS} from '../src/home/kitchen-light-readonly-status.mjs';

const read=(calls,idsAndStates)=>(id)=>{
 calls.push(id);
 return Promise.resolve({structuredContent:{data:{entity_id:id,state:idsAndStates[id]??'off'}}});
};
const kitchenIds=REVIEWED_KITCHEN_LIGHTS.map(e=>e.id);

test('all supported Russian kitchen questions use the four current HA IDs and never write',async()=>{
 for(const question of [
  'Какой свет на кухне?','Что со светом на кухне?',
  'Горит ли свет на кухне?','Какие лампы включены на кухне?',
  'Состояние света на кухне?'
 ]){
  const kitchenCalls=[],generalCalls=[];
  const r=await routeV3ReadonlyQuestion({
   text:question,
   readKitchenState:read(kitchenCalls,{'light.kukhnia_svet':'on'}),
   readState:read(generalCalls,{})
  });
  assert.deepEqual(kitchenCalls,kitchenIds,question);
  assert.deepEqual(generalCalls,[],question);
  assert.equal(r.handled,true);
  assert.equal(r.status,'complete');
  assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);
  assert.match(r.text,/из 4 выбранных сущностей/);
  assert.match(r.text,/включено 1, выключено 3, неизвестно или недоступно 0/);
  assert.match(r.text,/light\.kukhnia_svet/);
  assert.match(r.text,/НЕ весь свет кухни/);
 }
});

test('sauna question and tambour yes/no resolve only exact shared-reader entity IDs',async()=>{
 const saunaIds=[];
 const sauna=await routeV3ReadonlyQuestion({
  text:'Сколько градусов в сауне?',
  readState:read(saunaIds,{'sensor.sauna_te_sauna_temperature':'80.5'}),
  readKitchenState:()=>{throw Error('no kitchen reads');}
 });
 assert.deepEqual(saunaIds,['sensor.sauna_te_sauna_temperature','binary_sensor.sauna_sauna_te_sauna_ready']);
 assert.equal(sauna.status,'complete');
 assert.equal(sauna.text,'Температура сауны: 80.5 °C.');
 assert.equal(sauna.actualWrite,false);

 const lampIds=[];
 const tambour=await routeV3ReadonlyQuestion({
  text:'Горит ли свет в тамбуре?',
  readState:read(lampIds,{'light.tambur_svet_l1':'off'})
 });
 assert.deepEqual(lampIds,['light.tambur_svet_l1']);
 assert.equal(tambour.text,'Нет, свет в тамбуре выключен.');
 assert.equal(tambour.authorization,false);assert.equal(tambour.actualWrite,false);
});

test('light overview message reads only existing four overview entities, not whole house',async()=>{
 const ids=[];
 const r=await routeV3ReadonlyQuestion({
  text:'Где горит свет?',
  readState:read(ids,{'light.tambur_svet_l1':'on'})
 });
 assert.deepEqual(ids,LIGHT_OVERVIEW_IDS);
 assert.equal(r.status,'complete');assert.equal(r.actualWrite,false);
 assert.match(r.text,/состояния 4 выбранных сущностей HA, не число физических ламп/);
});

test('unsupported or malformed questions never trigger HA reads or fall through into action',async()=>{
 const calls=[];
 const reader=id=>{calls.push(id);throw Error('should not read');};
 for(const question of ['Что со светом на кухне и в гостиной?','Где мой телефон?','Какой свет на кухне;switch.vannaia_svet?']){
  const r=await routeV3ReadonlyQuestion({text:question,readState:reader,readKitchenState:reader});
  assert.equal(r.handled,true);
  assert.equal(r.status,'unsupported');
  assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
  assert.match(r.text,/пока не поддерживается/);
 }
 assert.deepEqual(calls,[]);
});

test('action intents are NOT intercepted by the read-only router or sent to MCP',async()=>{
 const calls=[];
 const reader=id=>{calls.push(id);throw Error('should not read');};
 for(const text of ['Включи свет в тамбуре','Выключи свет в тамбуре','Включи свет на кухне','Выключи свет на кухне']){
  const r=await routeV3ReadonlyQuestion({text,readState:reader,readKitchenState:reader});
  assert.deepEqual(r,{handled:false,authorization:false,actualWrite:false});
 }
 assert.deepEqual(calls,[]);
});

test('MCP failures remain uncertain and no raw error or fabricated OFF leaks into replies',async()=>{
 const secret='sensitive_endpoint_and_token_must_not_leak';
 const r=await routeV3ReadonlyQuestion({
  text:'Какой свет на кухне?',
  readKitchenState:async()=>{throw Error(secret);}
 });
 assert.equal(r.handled,true);assert.equal(r.status,'partial');
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.match(r.text,/неизвестно или недоступно 4/);
 assert.doesNotMatch(r.text,new RegExp(secret));
 assert.doesNotMatch(r.text,/выключено 4/);

 const sauna=await routeV3ReadonlyQuestion({
  text:'Какая температура в сауне?',
  readState:()=>{throw Error(secret);}
 });
 assert.equal(sauna.status,'unavailable');
 assert.match(sauna.text,/Не удалось получить достоверное состояние/);
 assert.doesNotMatch(sauna.text,new RegExp(secret));

 const missing=await routeV3ReadonlyQuestion({text:'Что со светом на кухне?'});
 assert.equal(missing.status,'unavailable');
 assert.equal(missing.actualWrite,false);
});

test('Telegram handler uses reviewed router without altering actor/confirmation gate or starting poller in tests',()=>{
 const source=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 const router=readFileSync(new URL('../src/pilot/v3-readonly-question-router.mjs',import.meta.url),'utf8');
 assert.match(source,/bot\.on\('message',async ctx=>\{/);
 assert.match(source,/if\(!allow\(ctx\)\)return;/);
 assert.match(source,/if\(typeof ctx\.message\?\.text!=='string'\|\|!ctx\.message\.text\.trim\(\)\)return;/);
 assert.match(source,/const routed=await readonlyFollowups\.route\(/);
 assert.match(source,/actor:actor\(ctx\)/);
 assert.match(source,/const readonlyFollowups=createV3ReadonlyFollowupRouter\(\)/);
 assert.match(source,/readKitchenState:id=>newLightRead\(id\)/);
 assert.match(source,/if\(routed\.handled\)return ctx\.reply\(routed\.text\);/);
 assert.match(source,/const r=pilot\.request\(actor\(ctx\),ctx\.message\?\.text\);/);
 assert.match(source,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
 assert.doesNotMatch(router,/ha_call_service|\.dispatch\(|\.confirm\(|bot\.launch|new Telegraf|pilot\.request/);
});
