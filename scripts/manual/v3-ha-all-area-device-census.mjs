#!/usr/bin/env node
// Operator-only read-only census of validated HA areas. No entity states,
// device identity printed, service calls or Telegram polling.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {approveAreaList} from '../../src/home/ha-mcp-safe-area-probe.mjs';
import {countAreaDevices} from '../../src/home/ha-all-area-device-census.mjs';
let client;
const timed=async task=>{
 let t;
 try{return await Promise.race([task,new Promise((_,reject)=>{
  t=setTimeout(()=>reject(Error('timeout')),12000);
 })]);}finally{clearTimeout(t);}
};
try{
 const raw=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const ep=inspectKitchenLanEndpoint(raw,{ownerApprovedLanHttpPilot:true});
 if(!ep.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-all-areas-readonly-census',version:'0.1.0'});
 await timed(client.connect(new StreamableHTTPClientTransport(ep.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const manifest=await timed(client.listTools());
 if(!approveAreaList(manifest?.tools?.find(x=>x?.name==='ha_list_floors_areas')))
  throw Error('area_schema_denied');
 const areaResponse=await timed(client.callTool({name:'ha_list_floors_areas',arguments:{}}));
 const census=await countAreaDevices({
  areaResponse,manifest:manifest.tools,
  readPage:async args=>await timed(client.callTool({name:'ha_get_device',arguments:args}))
 });
 console.log('AREA_DEVICE_CENSUS='+census.status);
 if(census.status!=='area_device_census_complete'){
  console.log('REASON='+census.reason);
  console.log('AREAS_CHECKED='+ (census.areasChecked??0));
  console.log('DEVICE_READ_CALLS='+census.calls);
  process.exitCode=1;
 }else{
  console.log('AREAS_CHECKED='+census.areasChecked);
  console.log('AREA_DEVICE_RECORDS='+census.areaDeviceRecords);
  console.log('DEVICE_READ_CALLS='+census.calls);
  for(const item of census.byArea)
   console.log('AREA_ORDINAL='+item.areaOrdinal+' DEVICES='+item.devices+' PAGES='+item.pages);
 }
 console.log('DEVICE_REGISTRY_COMPLETE=NO');
 console.log('ENTITY_LABEL_REGISTRIES_COMPLETE=NO');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
}catch(e){
 console.log('AREA_DEVICE_CENSUS=unavailable');
 console.log('REASON='+(e?.message==='timeout'?'timeout':'connection_or_schema_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
