import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NEW_LIGHT_CANDIDATES} from '../src/home/new-light-candidates.mjs';
import {ROOM_READONLY_GROUPS,summarizeCandidateRoom} from '../src/home/candidate-room-readonly-status.mjs';
import {SENSOR_READONLY_TARGETS,summarizeSelectedSensor} from '../src/home/selected-sensors-readonly.mjs';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';
import {createV3ReadonlyFollowupRouter} from '../src/pilot/v3-readonly-followup-router.mjs';
import {createKitchenMcpClient} from '../src/pilot/kitchen-mcp-client.mjs';

const actor={userId:123,chatId:123};
const mock=(calls=[],states={})=>async entity_id=>{
 calls.push(entity_id);
 return {structuredContent:{data:{entity_id,state:Object.hasOwn(states,entity_id)?states[entity_id]:'off'}}};
};

test('grouped candidate inventory includes precisely 19 unique fixed reviewed light IDs',()=>{
 const groups=Object.values(ROOM_READONLY_GROUPS);
 assert.deepEqual(groups.map(g=>g.targets.length),[6,1,2,7,3]);
 const flattened=groups.flatMap(g=>g.targets.map(t=>t.id));
 assert.equal(flattened.length,19);
 assert.deepEqual(new Set(flattened),new Set(NEW_LIGHT_CANDIDATES.map(c=>c.id)));
 assert.ok(flattened.every(id=>id.startsWith('light.')&&!id.startsWith('light.browser_mod')));
});

test('five room summaries read only exact scoped IDs, preserve unknown and deny writes',async()=>{
 for(const [room,group] of Object.entries(ROOM_READONLY_GROUPS)){
  const calls=[],special=group.targets[0].id;
  const reader=mock(calls,{[special]:'on',...(group.targets[1]?{[group.targets[1].id]:'unavailable'}:{})});
  const r=await summarizeCandidateRoom({room,readState:reader});
  assert.deepEqual(calls,group.targets.map(t=>t.id));
  assert.equal(r.authorization,false);
  assert.equal(r.actualWrite,false);
  assert.equal(r.counts.on,1);
  assert.equal(r.counts.unknown,group.targets.length>1?1:0);
  assert.match(r.text,/Управление запрещено/);
  assert.match(r.text,/не проверены/);
 }
 assert.equal((await summarizeCandidateRoom({room:'browser_mod',readState:mock()})).status,'unavailable');
});

test('selected sensors validate exact entity ID, unit bounds, numeric values, unknown',async()=>{
 for(const [key,target] of Object.entries(SENSOR_READONLY_TARGETS)){
  const ids=[],read=mock(ids,{[target.id]:key==='dishwasher_power'?'675.5':'89'});
  const out=await summarizeSelectedSensor({sensor:key,readState:read});
  assert.deepEqual(ids,[target.id]);
  assert.equal(out.status,'complete');
  assert.equal(out.authorization,false);
  assert.equal(out.actualWrite,false);
  assert.match(out.text,/без проверки свежести/);
  for(const bad of ['unknown','unavailable','-1','NaN','999999']){
   const r=await summarizeSelectedSensor({sensor:key,readState:mock([],{[target.id]:bad})});
   assert.equal(r.status,'unavailable');
  }
 }
 assert.equal((await summarizeSelectedSensor({sensor:'sensor.anything',readState:mock()})).status,'unavailable');
});

test('MCP permits exact read-only sensor IDs and denies writes and arbitrary sensor discovery',async()=>{
 const read=createKitchenMcpClient({endpointFile:'/does-not-exist-v3-bulk-readonly/mcp-url'});
 for(const {id} of Object.values(SENSOR_READONLY_TARGETS)){
  await assert.rejects(read('ha_get_state',{entity_id:id}),err=>err?.code==='ENOENT');
  await assert.rejects(read('ha_call_service',{domain:'sensor',service:'turn_on',entity_id:id}),/scope_denied/);
 }
 await assert.rejects(read('ha_get_state',{entity_id:'sensor.private_unknown'}),/scope_denied/);
 await assert.rejects(read('ha_get_state',{entity_id:'sensor.posudomoika_power',extra:true}),/scope_denied/);
});

test('Russian room, sensor, and mixed command questions have fail-closed intent classification',()=>{
 for(const [q,expected] of [
  ['Какой свет в гостиной?','living'],
  ['Какой свет в спальне?','bedroom'],
  ['Какой свет в ванной?','bathroom'],
  ['Какой дополнительный свет на кухне?','kitchen_extra'],
  ['Какой дополнительный свет в коридоре?','hallway_extra'],
  ['Мощность посудомойки?','dishwasher_power'],
  ['Батарея выключателя ванной?','bathroom_switch_battery']])
   assert.equal(classifyReadonlyQuestion(q),expected);
 for(const query of ['Какой свет в гостиной? Выключи всё','Мощность посудомойки? Перезагрузи HA'])
  assert.equal(classifyReadonlyQuestion(query),'unsupported_question');
});

test('conversational followup switches rooms without expanding candidate IDs',async()=>{
 const readerIds=[],general=mock(),candidate=mock(readerIds);
 const route=createV3ReadonlyFollowupRouter({clock:()=>5000}).route;
 const req=text=>route({actor,text,readState:general,readKitchenState:general,readCandidateState:candidate});
 const start=await req('Какой свет в гостиной?');
 assert.equal(start.status,'complete');
 assert.deepEqual(readerIds,ROOM_READONLY_GROUPS.living.targets.map(t=>t.id));
 readerIds.length=0;
 const follow=await req('А в спальне?');
 assert.equal(follow.status,'complete');
 assert.deepEqual(readerIds,ROOM_READONLY_GROUPS.bedroom.targets.map(t=>t.id));
 readerIds.length=0;
 const mixed=await req('А в гостиной? Включи свет');
 assert.equal(mixed.status,'unsupported');
 assert.deepEqual(readerIds,[]);
 assert.equal((await req('А в ванной?')).status,'unsupported');
});

test('bulk source never adds new light writes, extra poller or LLM authority',()=>{
 const telegram=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 const groups=readFileSync(new URL('../src/home/candidate-room-readonly-status.mjs',import.meta.url),'utf8');
 assert.match(telegram,/createReviewedLightReadonlyReader/);
 assert.match(telegram,/readCandidateState:id=>newLightRead\(id\)/);
 assert.match(telegram,/bot\.command\('confirm',async ctx=>/);
 assert.match(telegram,/bot\.command\('cancel',ctx=>/);
 assert.equal((telegram.match(/bot\.launch\(/g)||[]).length,1);
 assert.doesNotMatch(groups,/ha_call_service|dispatch\(/);
});
