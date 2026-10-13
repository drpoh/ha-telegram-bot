import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {routeV3ReadonlyQuestion} from '../src/pilot/v3-readonly-question-router.mjs';
import {createNewLightDispatch} from '../src/home/new-light-physical-dispatch.mjs';
import {REVIEWED_KITCHEN_LIGHTS} from '../src/home/kitchen-light-readonly-status.mjs';

const ids=REVIEWED_KITCHEN_LIGHTS.map(item=>item.id);
const kitchen='Что со светом на кухне?';

test('kitchen Telegram read-only path never grants an action and reads exactly four IDs',async()=>{
 const calls=[];
 const routed=await routeV3ReadonlyQuestion({
  text:kitchen,
  readKitchenState:async id=>{
   calls.push(id);
   return {structuredContent:{data:{entity_id:id,state:id===ids[1]?'unavailable':'off'}}};
  },
  readState:async()=>{throw Error('general light reader must not run');}
 });
 assert.deepEqual(calls,ids);
 assert.equal(routed.handled,true);
 assert.equal(routed.status,'partial');
 assert.equal(routed.authorization,false);
 assert.equal(routed.actualWrite,false);
 assert.match(routed.text,/включено 0, выключено 3, неизвестно или недоступно 1/);
 assert.match(routed.text,/НЕ весь свет кухни и НЕ число физических ламп/);
 assert.match(routed.text,/Идентичность устройств пока не подтверждена/);
});

test('ambiguous kitchen questions with embedded actions never fall through to consent',async()=>{
 let reads=0;
 for(const text of [
  'Что со светом на кухне? Выключи весь свет',
  'Какой свет на кухне;turn_on?',
  'Горит ли свет на кухне и в гостиной?',
  'Где горит свет? Включи свет в тамбуре'
 ]){
  const result=await routeV3ReadonlyQuestion({
   text,
   readState:()=>{reads++;throw Error('not authorized');},
   readKitchenState:()=>{reads++;throw Error('not authorized');}
  });
  assert.equal(result.handled,true,text);
  assert.equal(result.status,'unsupported',text);
  assert.equal(result.authorization,false,text);
  assert.equal(result.actualWrite,false,text);
 }
 assert.equal(reads,0);
});

test('kitchen physical dispatcher remains disabled even when offered explicit approval',async()=>{
 let calls=0,admissions=0;
 const dispatcher=createNewLightDispatch({
  releaseEnabled:false,approvedIds:[ids[2]],
  callTool:async()=>{calls++;throw Error('never call MCP');},
  verifyAdmission:async()=>{admissions++;return {valid:true};}
 });
 for(const service of ['turn_on','turn_off']){
  const result=await dispatcher.dispatch({
   action:{name:'ha_call_service',args:{domain:'light',service,entity_id:ids[2]}}
  });
  assert.equal(result.status,'denied');
  assert.equal(result.reason,'release_disabled');
  assert.equal(result.actualWrite,false);
 }
 assert.equal(calls,0);
 assert.equal(admissions,0);
});

test('Telegram source gates owner identity before router; returned readonly answers before action fallback',()=>{
 const src=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 const body=src.slice(src.indexOf("bot.on('message',async ctx=>{"));
 assert.ok(body.length>200);
 const allowIndex=body.indexOf('if(!allow(ctx))return;');
 const routeIndex=body.indexOf('const routed=await routeV3ReadonlyQuestion(');
 const stopIndex=body.indexOf('if(routed.handled)return ctx.reply(routed.text);');
 const actionIndex=body.indexOf('const r=pilot.request(actor(ctx),ctx.message?.text);');
 assert.ok(allowIndex>=0&&allowIndex<routeIndex);
 assert.ok(routeIndex>=0&&routeIndex<stopIndex&&stopIndex<actionIndex);
 assert.match(src,/const allow=ctx=>ctx\.chat\?\.type==='private'&&ctx\.chat\?\.id===userId&&ctx\.from\?\.id===userId/);
 assert.match(src,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
 assert.doesNotMatch(body.slice(routeIndex,stopIndex),/ha_call_service/);
});
