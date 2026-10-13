// Dedicated read-only HA-MCP transport for 19 fixed, unverified light candidates.
// Deliberately separate from the V3 pilot client that can dispatch allowed actions.
// Never accepts a tool name or arbitrary entity, and never grants physical authority.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../pilot/kitchen-lan-endpoint-policy.mjs';
import {NEW_LIGHT_IDS} from './new-light-candidates.mjs';

// Explicit additional read-only target observed in owner HA Template, 2026-10-13.
// Keep historic 19 review candidates and every action-capable client unchanged.
const reviewedIds=new Set([...NEW_LIGHT_IDS,'light.kukhnia_led_niz_l2']);
export function createReviewedLightReadonlyReader({
 endpointFile='/home/drpoh/.config/rs-home-ai-v3/mcp-url',
 readConfig=readFileSync,
 makeClient=()=>new Client({name:'rs-home-ai-v3-readonly-new-light',version:'0.1.0'}),
 makeTransport=url=>new StreamableHTTPClientTransport(url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })
}={}){
 return async entityId=>{
  // Validate scope before reading any private configuration or opening a connection.
  if(!reviewedIds.has(entityId))throw Error('scope_denied');
  const configured=readConfig(endpointFile,'utf8').trim();
  const endpoint=inspectKitchenLanEndpoint(configured,{ownerApprovedLanHttpPilot:true});
  if(!endpoint.allowed)throw Error('endpoint_denied');
  const client=makeClient();
  try{
   await client.connect(makeTransport(endpoint.url));
   return await client.callTool({name:'ha_get_state',arguments:{entity_id:entityId}});
  }finally{await client.close().catch(()=>{});}
 };
}
