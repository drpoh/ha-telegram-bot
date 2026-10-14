#!/usr/bin/env node
// Operator-triggered read-only floor/area schema probe, never starts Telegram.
// Outputs only nested property names, type labels and counts, no personal values.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {approveAreaList} from '../../src/home/ha-mcp-safe-area-probe.mjs';
import {describeFloorAreaStructure} from '../../src/home/ha-floor-area-shape.mjs';

let client;
const timed=async p=>{
 let t;
 try{return await Promise.race([p,new Promise((_,reject)=>{
  t=setTimeout(()=>reject(Error('timeout')),12000);
 })]);}finally{clearTimeout(t);}
};
try{
 const address=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const checked=inspectKitchenLanEndpoint(address,{ownerApprovedLanHttpPilot:true});
 if(!checked.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-floor-area-schema',version:'0.1.0'});
 await timed(client.connect(new StreamableHTTPClientTransport(checked.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const listed=await timed(client.listTools());
 const target=listed.tools?.find(x=>x.name==='ha_list_floors_areas');
 if(!approveAreaList(target))throw Error('schema_denied');
 const reply=await timed(client.callTool({
  name:'ha_list_floors_areas',arguments:{}
 }));
 if(reply.isError)throw Error('tool_error');
 const data=reply.structuredContent;
 const summary=describeFloorAreaStructure(data);
 console.log('AREA_STRUCTURE='+summary.status);
 if(summary.status!=='structure_only')throw Error('unexpected_shape');
 console.log('COUNTS='+JSON.stringify(summary.counts));
 for(const sample of summary.samples)
  console.log('SHAPE='+JSON.stringify(sample));
 console.log('AREA_READ_CALLS=1');
 console.log('HA_STATE_READS=0');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
}catch(err){
 console.log('AREA_STRUCTURE=unavailable');
 console.log('REASON='+(['timeout','schema_denied','unexpected_shape','tool_error'].includes(err?.message)?err.message:'connection_error'));
 process.exitCode=1;
}finally{if(client)await client.close().catch(()=>{});}
