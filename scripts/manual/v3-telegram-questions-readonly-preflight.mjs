#!/usr/bin/env node
// Manual Pi/HA-MCP acceptance for actual V3 natural-language Telegram read-only replies.
// Does NOT start Telegraf or issue a service call. No LLM or paid API required.
// Deliberately fixed phrases/scopes; this is NOT a production Telegram deployment.
import {routeV3ReadonlyQuestion} from '../../src/pilot/v3-readonly-question-router.mjs';
import {createKitchenMcpClient} from '../../src/pilot/kitchen-mcp-client.mjs';
import {createReviewedLightReadonlyReader} from '../../src/home/reviewed-light-readonly-client.mjs';
import {LIGHT_OVERVIEW_IDS} from '../../src/home/light-overview.mjs';
import {REVIEWED_KITCHEN_LIGHTS} from '../../src/home/kitchen-light-readonly-status.mjs';

const expectedArgs=['--readonly','--operator-approved'];
if(process.argv.length!==2+expectedArgs.length||
   process.argv.slice(2).some((arg,i)=>arg!==expectedArgs[i])){
 console.error('USAGE: node scripts/manual/v3-telegram-questions-readonly-preflight.mjs --readonly --operator-approved');
 process.exitCode=2;
}else{
 const generalIds=new Set([
  ...LIGHT_OVERVIEW_IDS,
  'sensor.sauna_te_sauna_temperature',
  'binary_sensor.sauna_sauna_te_sauna_ready'
 ]);
 const kitchenIds=new Set(REVIEWED_KITCHEN_LIGHTS.map(item=>item.id));
 const generalClient=createKitchenMcpClient({lanMvp:true,ownerApprovedLanHttpPilot:true});
 const kitchenClient=createReviewedLightReadonlyReader();
 const readState=id=>{
  if(!generalIds.has(id))throw Error('read_scope_denied');
  return generalClient('ha_get_state',{entity_id:id});
 };
 const readKitchenState=id=>{
  if(!kitchenIds.has(id))throw Error('read_scope_denied');
  return kitchenClient(id);
 };
 const probes=[
  ['SAUNA','Сколько градусов в сауне?'],
  ['TAMBOUR','Горит ли свет в тамбуре?'],
  ['LIGHTS','Где горит свет?'],
  ['KITCHEN','Что со светом на кухне?']
 ];
 let complete=0;
 for(const [name,text] of probes){
  try{
   const result=await routeV3ReadonlyQuestion({text,readState,readKitchenState});
   if(result.handled!==true||result.authorization!==false||
      result.actualWrite!==false||
      !['complete','partial','unavailable'].includes(result.status)||
      typeof result.text!=='string')throw Error('read_only_invariant');
   console.log('TELEGRAM_QUESTION_'+name+'_STATUS='+result.status);
   console.log('TELEGRAM_QUESTION_'+name+'_REPLY='+result.text);
   if(result.status==='complete')complete++;
  }catch{
   // Never reveal MCP exceptions, local endpoints, tokens or raw entity attributes.
   console.log('TELEGRAM_QUESTION_'+name+'_STATUS=unavailable');
   console.log('TELEGRAM_QUESTION_'+name+'_REPLY=Не удалось получить ответ, состояние неизвестно.');
  }
 }
 console.log('TELEGRAM_QUESTIONS_PHYSICAL_IDENTITY=unverified');
 console.log('TELEGRAM_QUESTIONS_TELEGRAM_POLLER_STARTED=false');
 console.log('TELEGRAM_QUESTIONS_HA_WRITE_ATTEMPTED=false');
 console.log('TELEGRAM_QUESTIONS_READONLY='+ (complete===probes.length?'PASS':'PARTIAL_OR_FAILED'));
 process.exitCode=complete===probes.length?0:1;
}
