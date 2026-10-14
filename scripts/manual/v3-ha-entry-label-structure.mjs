#!/usr/bin/env node
// Operator only, exactly two fixed read-only HA-MCP calls. No raw data printed.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {authorizeEntityLabelProof} from '../../src/home/ha-entity-label-mcp-proof.mjs';
import {inspectEntityEntryShape,inspectLabelListShape,classifyReviewedLabels} from '../../src/home/ha-entity-entry-label-shapes.mjs';
let client;
async function bounded(p){
 let t;
 try{return await Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(Error('timeout')),12000);})]);}
 finally{clearTimeout(t);}
}
try{
 const raw=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const ep=inspectKitchenLanEndpoint(raw,{ownerApprovedLanHttpPilot:true});
 if(!ep.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-entry-label-structure',version:'0.1.0'});
 await bounded(client.connect(new StreamableHTTPClientTransport(ep.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const tools=(await bounded(client.listTools())).tools;
 const allow=authorizeEntityLabelProof(tools);
 if(!allow.allowed)throw Error('schema_denied');
 const entity=await bounded(client.callTool({name:allow.entityName,arguments:allow.entityArgs}));
 const e=inspectEntityEntryShape(entity);
 console.log('ENTITY_ENTRY='+e.status);
 for(const field of e.fields)console.log('ENTRY_FIELD='+JSON.stringify(field));
 const labels=await bounded(client.callTool({name:allow.labelName,arguments:allow.labelArgs}));
 const l=inspectLabelListShape(labels);
 console.log('LABEL_LIST='+l.status);
 if(l.status==='label_list_shape_only'){
  console.log('LABEL_COUNT='+l.count);
  console.log('LABEL_FIELDS='+l.fields.join(','));
  const report=classifyReviewedLabels(labels.structuredContent.labels);
  console.log('LABEL_CATEGORY_COUNTS='+JSON.stringify(report.status==='counts_only'?report.totals:{}));
 }
 console.log('MCP_READ_CALLS=2');
 console.log('HA_STATE_READS=0');
 console.log('HA_WRITES=0');
 console.log('ENTITY_REGISTRY_COMPLETE=NO');
 console.log('PRODUCTION_CHANGED=NO');
 if(e.status!=='entity_shape_only'||l.status!=='label_list_shape_only')process.exitCode=1;
}catch(err){
 console.log('ENTRY_LABEL_AUDIT=unavailable');
 console.log('REASON='+(['timeout','schema_denied'].includes(err?.message)?err.message:'connection_or_shape_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
