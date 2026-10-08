import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {extractRoomWideLightQuery,checkAgentAreaLightScope as guard} from '../src/decision/agent-area-guard.mjs';
const args={domain:'light',service:'turn_off',entity_id:'light.room'};
const map={version:1,areas:[{area_id:'room',area_name:'Комната',light_ids:['light.room'],excluded_light_ids:['light.status'],switch_light_ids:[]}]};
async function fixture(fn){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'guard-area-'));
 const configPath=path.join(dir,'map.json');
 await fs.writeFile(configPath,JSON.stringify(map));
 const calls=[];
 const callTool=async(name,p)=>{
  calls.push({name,p});
  if(name==='ha_list_floors_areas') return {structuredContent:{success:true,floors:[{areas:[{area_id:'room',name:'Комната'}]}],unassigned_areas:[]}};
  if(name==='ha_search') return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:p.domain_filter==='light'?2:0,entities:p.domain_filter==='light'?[{entity_id:'light.room',domain:'light',area:'Комната'},{entity_id:'light.status',domain:'light',area:'Комната'}]:[]}};
  if(name==='ha_get_state')return {structuredContent:{data:{entity_id:p.entity_id,state:'off'}}};
  throw Error('unapproved tool');
 };
 try {await fn({configPath,callTool,calls})} finally{await fs.rm(dir,{force:true,recursive:true})}
}
test('extracts only explicit room-wide light request',()=>{
 assert.equal(extractRoomWideLightQuery('Выключи весь свет в комнате'),'комнате');
 assert.equal(extractRoomWideLightQuery('Выключи свет в ванной'),null);
 assert.equal(extractRoomWideLightQuery('Выключи всё в доме'),null);
});
test('missing approved mapping fails without any device search',async()=>{
 await fixture(async ({callTool,calls})=>{
  const r=await guard({userText:'Выключи весь свет в комнате',toolName:'ha_call_service',args,configPath:'/no/map',callTool});
  assert.equal(r.allowed,false);
  assert.deepEqual(calls.map(c=>c.name),['ha_list_floors_areas']);
 });
});
test('exact full room can pass independent scope check only',async()=>{
 await fixture(async ({configPath,callTool,calls})=>{
  const r=await guard({userText:'Выключи весь свет в Комната',toolName:'ha_call_service',args,configPath,callTool});
  assert.equal(r.status,'verified_area_scope');assert.equal(r.allowed,true);
  assert.equal(calls.some(c=>c.name==='ha_call_service'),false);
 });
});
test('expanded LLM target blocked',async()=>{
 await fixture(async ({configPath,callTool})=>{
  const r=await guard({userText:'Выключи весь свет в Комната',toolName:'ha_call_service',args:{...args,entity_id:['light.room','light.other']},configPath,callTool});
  assert.equal(r.allowed,false);
 });
});
test('non-room request remains unchanged',async()=>{
 const r=await guard({userText:'Выключи свет в ванной',toolName:'ha_call_service',args,callTool:async()=>{throw Error('should not read')}});
 assert.equal(r.status,'not_applicable');
});

test('alternate explicit plural lights resolve area',()=>{
 assert.equal(extractRoomWideLightQuery('Выключи все лампы в Комната'),'комната');
 assert.equal(extractRoomWideLightQuery('Включи все светильники в Комната'),'комната');
});
test('unparsed room-wide intent is blocked without MCP calls',async()=>{
 const calls=[];const callTool=async(name)=>{calls.push(name);throw Error('no read needed')};
 for(const userText of ['Выключи весь свет на кухне','Погаси весь свет в гостиной','Выключи всё освещение в комнате']){
  const r=await guard({userText,toolName:'ha_call_service',args,callTool});
  assert.equal(r.allowed,false,userText);assert.equal(r.status,'unresolved_room_wide_intent');
 }
 assert.deepEqual(calls,[]);
});
