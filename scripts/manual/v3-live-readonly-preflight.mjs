#!/usr/bin/env node
// Operator-invoked read-only HA-MCP acceptance; NO Telegram poller or write tool.
import {createKitchenMcpClient} from '../src/pilot/kitchen-mcp-client.mjs';
import {summarizeSauna} from '../src/home/sauna-status.mjs';
import {summarizeLightOverview} from '../src/home/light-overview.mjs';
import {summarizeTambourLight} from '../src/home/tambour-light-status.mjs';

const timeoutMs=45000;
const read=createKitchenMcpClient({lanMvp:true,ownerApprovedLanHttpPilot:true});
const onlyRead=id=>read('ha_get_state',{entity_id:id});
const jobs=[['SAUNA',summarizeSauna],['LIGHTS',summarizeLightOverview],['TAMBOUR',summarizeTambourLight]];
let failures=0;
for(const [name,summary] of jobs){
 try{
  const result=await Promise.race([
   summary({readState:onlyRead}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),timeoutMs))
  ]);
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
process.exitCode=failures?1:0;
