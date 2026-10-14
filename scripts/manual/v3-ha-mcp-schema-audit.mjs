#!/usr/bin/env node
// Operator-only read-only schema inspection using existing trusted MCP endpoint.
// listTools() only. Does not call any HA tools, expose endpoint or tokens,
// launch Telegram, or alter active V3/V2.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {inspectHARegistrySchemas} from '../../src/home/ha-mcp-registry-schema-audit.mjs';
const timeout=12000;
const bounded=async promise=>{
 let timer;
 try{return await Promise.race([promise,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('timeout')),timeout);
 })]);}finally{clearTimeout(timer);}
};
let client;
try{
 const raw=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const policy=inspectKitchenLanEndpoint(raw,{ownerApprovedLanHttpPilot:true});
 if(!policy.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-mcp-schema-audit',version:'0.1.0'});
 const transport=new StreamableHTTPClientTransport(policy.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 });
 await bounded(client.connect(transport));
 const listed=await bounded(client.listTools());
 const report=inspectHARegistrySchemas(listed?.tools);
 console.log('SCHEMA_AUDIT='+report.status);
 console.log('TOOLS_TOTAL='+report.toolCount);
 for(const item of report.tools){
  console.log('TOOL '+item.name+' '+(item.available?'EXPOSED':'NOT_EXPOSED')+
   ' schema='+item.schema+
   ' required='+item.required.join(',')+
   ' args='+item.fields.map(x=>x.name+':'+x.type).join(',')+
   ' other_fields='+item.extraFieldCount);
 }
 console.log('FULL_REGISTRY_VERIFIED=NO');
 console.log('TOOLS_CALLED=0');
 console.log('HA_WRITES=NO');
 console.log('PRODUCTION_CHANGED=NO');
}catch(err){
 console.log('SCHEMA_AUDIT=unavailable');
 console.log('REASON='+ (err?.message==='timeout'?'timeout':'connection_or_manifest_error'));
 process.exitCode=1;
}finally{if(client)await client.close().catch(()=>{});}
