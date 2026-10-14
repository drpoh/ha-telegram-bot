import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';
import {summarizeCorridorLights} from '../src/home/corridor-light-readonly-status.mjs';

const corridor=['light.koridor','light.koridor_1_etazh','light.koridor_spot'];
test('pinned release allows only exact Russian corridor read questions',()=>{
 for(const text of ['Какой свет в коридоре?','Что со светом в коридоре?','Горит ли свет в коридоре?','Состояние света в коридоре?'])
  assert.equal(classifyReadonlyQuestion(text),'corridor');
 for(const text of ['Какой свет в коридоре? Выключи всё','Что со светом в спальне?'])
  assert.equal(classifyReadonlyQuestion(text),'unsupported_question');
 assert.notEqual(classifyReadonlyQuestion('Включи свет в коридоре'),'corridor');
});
test('pinned corridor uses only existing overview ID subset; unavailable never counted OFF',async()=>{
 const calls=[];
 const result=await summarizeCorridorLights({readState:async entity_id=>{
  calls.push(entity_id);
  return {structuredContent:{data:{entity_id,state:entity_id===corridor[0]?'on':entity_id===corridor[1]?'unavailable':'off'}}};
 }});
 assert.deepEqual(calls,corridor);
 assert.equal(result.status,'partial');
 assert.deepEqual(result.counts,{on:1,off:1,unknown:1});
 assert.equal(result.authorization,false);
 assert.equal(result.actualWrite,false);
 assert.match(result.text,/не весь физический свет коридора/);
});
test('pinned Telegram direct corridor route stays within readonly branch and same poller',()=>{
 const s=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 assert.match(s,/if\(intent==='corridor'\)return replyRead\(summarizeCorridorLights\(\{readState:id=>saunaRead\('ha_get_state',\{entity_id:id\}\)\}\)\)/);
 assert.match(s,/lightFollowups\.remember\(/);
 assert.match(s,/lightFollowups\.route\(/);
 assert.equal((s.match(/bot\.launch\(/g)||[]).length,1);
 assert.match(s,/bot\.command\('confirm',async ctx=>/);
 assert.match(s,/bot\.command\('cancel',ctx=>/);
 assert.equal((s.match(/createNewLightDispatch/g)||[]).length,0);
});
