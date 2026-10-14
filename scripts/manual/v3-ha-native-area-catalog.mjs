#!/usr/bin/env node
// Read-only, operator-invoked area catalog validation on existing HA-MCP.
// No room names/IDs, tokens, entity states or source records printed.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {approveAreaList} from '../../src/home/ha-mcp-safe-area-probe.mjs';
import {buildNativeHAAreaCatalog,summarizeAreaCatalogCoverage} from '../../src/home/ha-native-area-catalog.mjs';
const timed=p=>{
 let timer;
 return Promise.race([p,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('audit_timeout')),12000);
 })]).finally(()=>clearTimeout(timer));
};
let client;
try{
 const endpoint=inspectKitchenLanEndpoint(
  readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim(),
  {ownerApprovedLanHttpPilot:true}
 );
 if(!endpoint.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-area-catalog-audit',version:'0.1.0'});
 await timed(client.connect(new StreamableHTTPClientTransport(endpoint.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const manifest=await timed(client.listTools());
 if(!approveAreaList(manifest.tools?.find(x=>x.name==='ha_list_floors_areas')))
  throw Error('schema_denied');
 const result=await timed(client.callTool({name:'ha_list_floors_areas',arguments:{}}));
 const catalog=buildNativeHAAreaCatalog(result);
 const summary=summarizeAreaCatalogCoverage(catalog);
 console.log('AREA_CATALOG='+summary.status);
 if(summary.status!=='areas_only')throw Error('catalog_unverified');
 console.log('FLOORS='+summary.floors);
 console.log('AREAS='+summary.areas);
 console.log('UNASSIGNED='+summary.unassigned);
 console.log('AREA_LABEL_REFERENCES='+summary.areaLabelReferences);
 console.log('DEVICE_ENTITY_LABEL_REGISTRIES=NOT_VERIFIED');
 console.log('MCP_AREA_READS=1');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
}catch(e){
 console.log('AREA_CATALOG=unavailable');
 console.log('REASON='+(['audit_timeout','schema_denied','catalog_unverified'].includes(e?.message)?e.message:'endpoint_or_read_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
