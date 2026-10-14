#!/usr/bin/env node
// Operator-only: one fixed domain light metadata request, no state or HA writes.
// Never prints entity IDs, names, values, endpoints, tokens or raw responses.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {admitEntityDomainMetadata,inspectEntityDomainReply} from '../../src/home/ha-entity-domain-mcp-proof.mjs';
let client;
const bounded=async promise=>{
 let timer;
 try{return await Promise.race([promise,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('timeout')),12000);
 })]);}finally{clearTimeout(timer);}
};
try{
 const endpoint=inspectKitchenLanEndpoint(
  readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim(),
  {ownerApprovedLanHttpPilot:true});
 if(!endpoint.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-entity-domain-proof',version:'0.1.0'});
 await bounded(client.connect(new StreamableHTTPClientTransport(endpoint.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const tools=(await bounded(client.listTools())).tools;
 const gate=admitEntityDomainMetadata({manifest:tools,domain:'light'});
 if(!gate.allowed)throw Error('schema_denied');
 const result=await bounded(client.callTool({name:gate.tool,arguments:gate.args}));
 const report=inspectEntityDomainReply(result);
 console.log('ENTITY_DOMAIN_PROBE='+report.status);
 for(const field of report.fields)console.log('FIELD='+JSON.stringify(field));
 console.log('MCP_READ_CALLS=1');
 console.log('DOMAIN=light');
 console.log('REGISTRY_COMPLETE=NO');
 console.log('HA_STATE_READS=0');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
 if(report.status!=='shape_only')process.exitCode=1;
}catch(error){
 console.log('ENTITY_DOMAIN_PROBE=unavailable');
 console.log('REASON='+ (error?.message==='timeout'?'timeout':
  error?.message==='schema_denied'?'schema_denied':'connection_or_read_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
