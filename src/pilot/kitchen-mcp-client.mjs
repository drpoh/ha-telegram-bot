import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
export function createKitchenMcpClient({endpointFile='/home/drpoh/.config/rs-home-ai-v3/mcp-url'}={}){
 return async (name,args)=>{
  if(!['ha_get_state','ha_call_service'].includes(name) || args?.entity_id!=='light.led_kukhnia')throw Error('scope_denied');
  if(name==='ha_call_service'&&(args.domain!=='light'||!['turn_on','turn_off'].includes(args.service)))throw Error('scope_denied');
  const url=new URL(readFileSync(endpointFile,'utf8').trim());
  if(!['http:','https:'].includes(url.protocol)||!['homeassistant.local','127.0.0.1','localhost'].includes(url.hostname))throw Error('endpoint_denied');
  const client=new Client({name:'rs-home-ai-v3-kitchen',version:'0.1.0'});
  try{await client.connect(new StreamableHTTPClientTransport(url));return await client.callTool({name,arguments:args});}
  finally{await client.close().catch(()=>{});}
 };
}
