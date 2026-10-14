#!/usr/bin/env node
// Fixed, bounded, read-only HA-MCP area read + schema inspection.
// Prints only counts, nested structural field names/types, not room names,
// IDs, entity state, private URLs, tokens or MCP responses.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {approveAreaList} from '../../src/home/ha-mcp-safe-area-probe.mjs';
import {summarizeHAAreaStructure} from '../../src/home/ha-area-structure-report.mjs';
import {inspectHARegistrySchemas} from '../../src/home/ha-mcp-registry-schema-audit.mjs';
let client;
async function bounded(promise){
 let timer;
 try{
  return await Promise.race([promise,new Promise((_,reject)=>{
   timer=setTimeout(()=>reject(Error('audit_timeout')),15000);
  })]);
 }finally{clearTimeout(timer);}
}
try{
 const address=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const policy=inspectKitchenLanEndpoint(address,{ownerApprovedLanHttpPilot:true});
 if(!policy.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-areas-structure-audit',version:'0.1.0'});
 const transport=new StreamableHTTPClientTransport(policy.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 });
 await bounded(client.connect(transport));
 const manifest=await bounded(client.listTools());
 const allowed=manifest?.tools?.find(x=>x?.name==='ha_list_floors_areas');
 if(!approveAreaList(allowed))throw Error('schema_denied');
 const raw=await bounded(client.callTool({name:'ha_list_floors_areas',arguments:{}}));
 const report=summarizeHAAreaStructure(raw);
 console.log('AREA_STRUCTURE='+report.status);
 if(report.status!=='shape_only')throw Error('data_unavailable');
 console.log('COUNTS floor='+report.floorCount+' area='+report.areaCount+
  ' unassigned='+report.unassignedCount+' orphaned='+report.orphanedCount);
 console.log('FLOOR_SHAPE='+JSON.stringify(report.floors));
 console.log('UNASSIGNED_SHAPE='+JSON.stringify(report.unassigned));
 console.log('ORPHANED_SHAPE='+JSON.stringify(report.orphaned));
 const schemas=inspectHARegistrySchemas(manifest.tools);
 for(const tool of schemas.tools){
  if(!['ha_get_device','ha_get_entity','ha_search','ha_config_get_label','ha_config_get_category'].includes(tool.name))continue;
  console.log('TOOL_SCHEMA '+tool.name+' fields='+
   tool.fields.map(x=>x.name+':'+x.type).join(',')+
   ' unknown_fields='+tool.extraFieldCount);
 }
 console.log('MCP_READ_TOOL_CALLS=1');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
}catch(e){
 console.log('AUDIT=FAILED');
 console.log('REASON='+(['audit_timeout','schema_denied','data_unavailable'].includes(e?.message)?e.message:'connection_or_read_error'));
 process.exitCode=1;
}finally{if(client)await client.close().catch(()=>{});}
