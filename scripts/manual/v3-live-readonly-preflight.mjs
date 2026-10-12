#!/usr/bin/env node
// Operator-invoked read-only HA-MCP acceptance; NO Telegram poller or write tool.
import {createKitchenMcpClient} from '../../src/pilot/kitchen-mcp-client.mjs';
import {summarizeSauna} from '../../src/home/sauna-status.mjs';
import {summarizeLightOverview,LIGHT_OVERVIEW_IDS} from '../../src/home/light-overview.mjs';
import {summarizeTambourLight} from '../../src/home/tambour-light-status.mjs';
import {describeScopedLightIdentity} from '../../src/home/light-inventory-identity.mjs';

const timeoutMs=45000;
const read=createKitchenMcpClient({lanMvp:true,ownerApprovedLanHttpPilot:true});
const onlyRead=id=>read('ha_get_state',{entity_id:id});
const jobs=[['SAUNA',summarizeSauna],['LIGHTS',summarizeLightOverview],['TAMBOUR',summarizeTambourLight]];
const bounded=async task=>{
 let handle;
 try{return await Promise.race([task,new Promise((_,reject)=>{handle=setTimeout(()=>reject(Error('timeout')),timeoutMs);})]);}
 finally{clearTimeout(handle);}
};
let failures=0;
for(const [name,summary] of jobs){
 try{
  const result=await bounded(summary({readState:onlyRead}));
  if(result.authorization!==false||result.actualWrite!==false)throw Error('authorization_invariant');
  console.log(name+'_STATUS='+result.status);
  console.log(name+'_TEXT='+result.text);
  if(result.status!=='complete')failures++;
 }catch(e){
  failures++;
  console.log(name+'_STATUS=unavailable');
  console.log(name+'_ERROR='+((e?.message==='timeout')?'timeout':'read_failed'));
 }
}
console.log('READONLY_PREFLIGHT='+ (failures?'PARTIAL_OR_FAILED':'PASS'));

{
 // Diagnoses only fixed previously approved entities; do not search for alternatives.
 // No raw MCP response or private endpoint is ever printed.
 for(const id of LIGHT_OVERVIEW_IDS){
  try{
   const raw=await bounded(onlyRead(id));
   const envelope=raw?.structuredContent??raw;
   const data=envelope?.data??envelope;
   const state=raw?.isError===true?'mcp_error':data?.entity_id!==id?'identity_mismatch':
    data?.state==='unavailable'?'unavailable':data?.state==='unknown'?'unknown':
    ['on','off'].includes(data?.state)?'ok':'invalid_response';
   console.log('LIGHT_INVENTORY '+id+' '+state);
   console.log(describeScopedLightIdentity(id,raw).text);
  }catch(e){console.log('LIGHT_DIAGNOSTIC '+id+' '+(e?.message==='timeout'?'timeout':'read_error'));}
 }
}
process.exitCode=failures?1:0;
