#!/usr/bin/env node
// Operator-only: ONE native HA area + ONE ha_get_device read; no state or writes.
// Output only structural field names and array lengths, never device IDs, names, URLs.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {approveAreaList} from '../../src/home/ha-mcp-safe-area-probe.mjs';
import {admitAreaDeviceProbe,summarizeAreaDeviceProbe} from '../../src/home/ha-area-device-mcp-probe.mjs';
let client;
const bounded=async p=>{
 let timer;
 try{return await Promise.race([p,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('timeout')),12000);
 })]);}finally{clearTimeout(timer);}
};
try{
 const configured=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
 const endpoint=inspectKitchenLanEndpoint(configured,{ownerApprovedLanHttpPilot:true});
 if(!endpoint.allowed)throw Error('endpoint_denied');
 client=new Client({name:'rs-home-ai-v3-one-area-device-probe',version:'0.1.0'});
 await bounded(client.connect(new StreamableHTTPClientTransport(endpoint.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 })));
 const manifest=await bounded(client.listTools());
 if(!approveAreaList(manifest?.tools?.find(x=>x.name==='ha_list_floors_areas')))
  throw Error('area_tool_denied');
 const areaReply=await bounded(client.callTool({name:'ha_list_floors_areas',arguments:{}}));
 const admission=admitAreaDeviceProbe({manifest:manifest.tools,areaResponse:areaReply});
 if(!admission.allowed)throw Error('device_tool_denied');
 const deviceReply=await bounded(client.callTool({name:admission.tool,arguments:admission.args}));
 const result=summarizeAreaDeviceProbe(deviceReply);
 console.log('AREA_DEVICE_PROBE='+result.status);
 for(const field of result.fields??[])console.log('FIELD '+JSON.stringify(field));
 console.log('HA_MCP_CALLS=2');
 console.log('AREA_SCOPE=ONE_VERIFIED_AREA');
 console.log('HA_STATE_READS=0');
 console.log('HA_WRITES=0');
 console.log('FULL_REGISTRY_VERIFIED=NO');
 console.log('PRODUCTION_CHANGED=NO');
 if(result.status!=='shape_only')process.exitCode=1;
}catch(e){
 console.log('AREA_DEVICE_PROBE=unavailable');
 console.log('REASON='+(['timeout','area_tool_denied','device_tool_denied'].includes(e?.message)?e.message:'connection_or_read_error'));
 process.exitCode=1;
}finally{await client?.close().catch(()=>{});}
