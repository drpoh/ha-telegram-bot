import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenMcpEndpoint} from './kitchen-mcp-endpoint-policy.mjs';
import {inspectKitchenLanEndpoint} from './kitchen-lan-endpoint-policy.mjs';
export function createKitchenMcpClient({endpointFile='/home/drpoh/.config/rs-home-ai-v3/mcp-url',lanMvp=false,networkRestrictionVerified=false,credentialScopeReviewed=false,ownerApprovedLanHttpPilot=false}={}){
 return async (name,args)=>{
  if(!['ha_get_state','ha_call_service'].includes(name) || args?.entity_id!=='light.tambur_svet_l1')throw Error('scope_denied');
  if(name==='ha_call_service'&&(args.domain!=='light'||!['turn_on','turn_off'].includes(args.service)))throw Error('scope_denied');
  const configured=readFileSync(endpointFile,'utf8').trim();
  const endpoint=lanMvp===true
   ?inspectKitchenLanEndpoint(configured,{networkRestrictionVerified,credentialScopeReviewed,ownerApprovedLanHttpPilot})
   :inspectKitchenMcpEndpoint(configured);
  if(!endpoint.allowed)throw Error(endpoint.reason);
  const url=endpoint.url;
  const client=new Client({name:'rs-home-ai-v3-kitchen',version:'0.1.0'});
  // Never follow server-driven redirects to a different, unreviewed origin.
  const noRedirectFetch=(input,init)=>fetch(input,{...init,redirect:'error'});
  try{await client.connect(new StreamableHTTPClientTransport(url,{fetch:noRedirectFetch,requestInit:{redirect:'error'}}));return await client.callTool({name,arguments:args});}
  finally{await client.close().catch(()=>{});}
 };
}
