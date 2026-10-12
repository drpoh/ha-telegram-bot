#!/usr/bin/env node
// Operator-only, opt-in read-only HA-MCP identity check of 19 reviewed candidates.
// Does not import/change production MCP allowlist, run a Telegram poller or call HA services.
import {readFileSync} from 'node:fs';
import {classifyMcpConnectionFailure} from '../../src/home/mcp-connection-failure.mjs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {NEW_LIGHT_IDS} from '../../src/home/new-light-candidates.mjs';
import {inspectNewLights} from '../../src/home/new-light-review.mjs';

if(process.argv.slice(2).join(' ')!=='--readonly --operator-approved'){
 console.error('USAGE: node scripts/manual/v3-new-lights-readonly-preflight.mjs --readonly --operator-approved');
 process.exitCode=2;
}else{
 let client;
 let phase='configuration';
 let connectionFailure='none';
 try{
  const raw=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
  const endpoint=inspectKitchenLanEndpoint(raw,{ownerApprovedLanHttpPilot:true});
  if(!endpoint.allowed)throw Error('endpoint_denied');
  phase='connection';
  client=new Client({name:'rs-home-ai-v3-manual-new-light-review',version:'0.1.0'});
  try{
   await client.connect(new StreamableHTTPClientTransport(endpoint.url,{
    fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
    requestInit:{redirect:'error'}
   }));
  }catch(error){connectionFailure=classifyMcpConnectionFailure(error);throw error;}
  phase='inspection';
  const allowed=new Set(NEW_LIGHT_IDS);
  const result=await inspectNewLights({readState:async id=>{
   if(!allowed.has(id)||id.startsWith('light.browser_mod'))throw Error('scope_denied');
   return await client.callTool({name:'ha_get_state',arguments:{entity_id:id}});
  }});
  if(result.authorization!==false||result.actualWrite!==false)throw Error('authorization_invariant');
  for(const entry of result.entries){
   // Only IDs and states. Do not print raw MCP response, URLs, attributes or credentials.
   console.log('NEW_LIGHT '+entry.id+' '+entry.state+' '+entry.reason);
  }
  console.log('NEW_LIGHT_REVIEW='+result.status);
  console.log('NEW_LIGHT_COUNTS='+JSON.stringify(result.counts));
  console.log('NEW_LIGHT_READ_SCOPE=19_CANDIDATES_ONLY');
  process.exitCode=result.status==='complete'?0:1;
 }catch{
  // Stable phase code only: never print exception, endpoint, network URL or token.
  console.error('NEW_LIGHT_REVIEW=read_failed');
  console.error('NEW_LIGHT_FAILURE_PHASE='+phase);
  if(phase==='connection')console.error('NEW_LIGHT_CONNECTION_REASON='+connectionFailure);
  process.exitCode=1;
 }finally{
  if(client)await client.close().catch(()=>{});
 }
}
