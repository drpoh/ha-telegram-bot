#!/usr/bin/env node
// Operator-only metadata shape check. No HA service calls, raw values or
// credentials printed. Reads one already-reviewed entity and label metadata.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {authorizeEntityLabelProof,summarizeEntityLabelShape} from '../../src/home/ha-entity-label-mcp-proof.mjs';
let client;
const bounded=async task=>{
 let timer;
 try{return await Promise.race([task,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('timeout')),12000);
 })]);}finally{clearTimeout(timer);}
};
try{
 const configured=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const endpoint=inspectKitchenLanEndpoint(configured,{ownerApprovedLanHttpPilot:true});
 if(!endpoint.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-entity-label-shape',version:'0.1.0'});
 await bounded(client.connect(new StreamableHTTPClientTransport(endpoint.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const manifest=await bounded(client.listTools());
 const admitted=authorizeEntityLabelProof(manifest.tools);
 if(!admitted.allowed)throw Error('schema_denied');
 const results=[];
 for(const [kind,name,args] of [
  ['ENTITY',admitted.entityName,admitted.entityArgs],
  ['LABEL',admitted.labelName,admitted.labelArgs]
 ]){
  let result;
  try{
   const response=await bounded(client.callTool({name,arguments:args}));
   result=summarizeEntityLabelShape(response);
  }catch{result={status:'unavailable'};}
  console.log(kind+'_METADATA='+result.status);
  for(const field of result.fields??[])console.log(kind+'_FIELD='+JSON.stringify(field));
  results.push(result.status);
 }
 console.log('MCP_METADATA_READ_CALLS=2');
 console.log('HA_WRITES=0');
 console.log('ENTITY_LABEL_REGISTRY_COMPLETE=NO');
 console.log('PRODUCTION_CHANGED=NO');
 if(results.every(s=>s!=='shape_only'))process.exitCode=1;
}catch(e){
 console.log('ENTITY_LABEL_PROBE=unavailable');
 console.log('REASON='+ (e?.message==='timeout'?'timeout':'connection_or_schema_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
