#!/usr/bin/env node
// Read only the HA-MCP manifest. Do NOT invoke HA tools or print schema examples.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {auditKnownMCPArgumentShapes} from '../../src/home/ha-mcp-argument-shapes.mjs';
let client;
const within=async task=>{
 let timer;
 try{return await Promise.race([task,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('timeout')),12000);
 })]);}finally{clearTimeout(timer);}
};
try{
 const url=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const endpoint=inspectKitchenLanEndpoint(url,{ownerApprovedLanHttpPilot:true});
 if(!endpoint.allowed)throw Error('denied');
 client=new Client({name:'rs-home-ai-v3-mcp-arg-shapes',version:'0.1.0'});
 await within(client.connect(new StreamableHTTPClientTransport(endpoint.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const manifest=await within(client.listTools());
 const report=auditKnownMCPArgumentShapes(manifest?.tools);
 for(const tool of report.tools){
  console.log('TOOL '+tool.name+' '+tool.status);
  if(tool.status==='shape_only'){
   console.log('PARAMS '+tool.name+' '+tool.supported.map(p=>
    p.key+':'+p.type+(p.hasItems?'[]':'')+(p.enumCount?'#'+p.enumCount:'')
   ).join(','));
   console.log('REQUIRED '+tool.name+' '+tool.requiredKnown.join(',')+
    ' UNKNOWN_REQUIRED='+tool.unknownRequiredCount+
    ' OTHER_FIELDS='+tool.otherFieldCount);
  }
 }
 console.log('MCP_TOOLS_CALLED=0');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
}catch(e){
 console.log('AUDIT=unavailable');
 console.log('REASON='+ (e?.message==='timeout'?'timeout':'connection_or_schema_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
