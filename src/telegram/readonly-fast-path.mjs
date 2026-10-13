// Optional V2 fast path for a fixed set of Russian read-only Home Assistant questions.
// Reuse the tested V3 router and existing V2 MCP connection; no LLM, discovery or HA writes.
// This module cannot authorize a physical action. Unrecognized requests return unhandled.
import {getMcpClient} from '../mcp/client.mjs';
import {routeV3ReadonlyQuestion} from '../pilot/v3-readonly-question-router.mjs';
import {classifyReadonlyQuestion} from '../home/readonly-question-intent.mjs';
import {LIGHT_OVERVIEW_IDS} from '../home/light-overview.mjs';
import {REVIEWED_KITCHEN_LIGHTS} from '../home/kitchen-light-readonly-status.mjs';

const fastIntents=new Set(['sauna','lights','tambour','kitchen_review']);
const fixedIds=new Set([
 'sensor.sauna_te_sauna_temperature',
 'binary_sensor.sauna_sauna_te_sauna_ready',
 'light.tambur_svet_l1',
 ...LIGHT_OVERVIEW_IDS,
 ...REVIEWED_KITCHEN_LIGHTS.map(({id})=>id)
]);
const denied=Object.freeze({
 handled:true,status:'unavailable',authorization:false,actualWrite:false,
 text:'Не удалось проверить состояние выбранных устройств. Никаких команд не отправлено.'
});

// Only ha_get_state, only the reviewed identifiers. Check scope BEFORE accessing V2 MCP.
export function createExactV2ReadonlyReader({getClient=getMcpClient}={}){
 return async entityId=>{
  if(!fixedIds.has(entityId))throw Error('read_scope_denied');
  const client=getClient();
  if(typeof client?.callTool!=='function')throw Error('mcp_unavailable');
  return client.callTool({name:'ha_get_state',arguments:{entity_id:entityId}});
 };
}

export async function answerV2ReadonlyFastPath({text,readState}={}){
 // V2 remains the general conversational assistant. Unknown questions, commands
 // and incomplete room requests must stay on the existing AI + policy route.
 const intent=classifyReadonlyQuestion(text);
 if(!fastIntents.has(intent))return {
  handled:false,authorization:false,actualWrite:false
 };
 try{
  const reader=typeof readState==='function'?readState:createExactV2ReadonlyReader();
  const r=await routeV3ReadonlyQuestion({
   text,readState:reader,readKitchenState:reader
  });
  if(r?.handled!==true||!['complete','partial','unavailable'].includes(r?.status)||
     r.authorization!==false||r.actualWrite!==false||
     typeof r.text!=='string'||!r.text.trim())return {...denied};
  return r;
 }catch{return {...denied};}
}
