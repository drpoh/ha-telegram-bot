#!/usr/bin/env node
// Operator-invoked, manifest-only HA-MCP capability audit: listTools() ONLY.
// Does not invoke ha_get_state, ha_call_service, registries, Telegram or HA writes.
// No tokens/endpoints/tool arguments printed; uses existing private endpoint config.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {inspectHARegistryCapabilities} from '../../src/home/ha-registry-mcp-capabilities.mjs';

const file='/home/drpoh/.config/rs-home-ai-v3/mcp-url';
let client;
const timeoutMs=12000;
const bounded=async p=>{
 let t;
 try{return await Promise.race([p,new Promise((_,reject)=>{
  t=setTimeout(()=>reject(Error('audit_timeout')),timeoutMs);
 })]);}finally{clearTimeout(t);}
};
try{
 const configured=readFileSync(file,'utf8').trim();
 const endpoint=inspectKitchenLanEndpoint(configured,{ownerApprovedLanHttpPilot:true});
 if(!endpoint.allowed)throw Error('endpoint_policy_denied');
 client=new Client({name:'rs-home-ai-v3-registry-capability-audit',version:'0.1.0'});
 const transport=new StreamableHTTPClientTransport(endpoint.url,{
  fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
  requestInit:{redirect:'error'}
 });
 await bounded(client.connect(transport));
 const manifest=await bounded(client.listTools());
 const report=inspectHARegistryCapabilities(manifest?.tools);
 console.log('HA_MCP_CAPABILITY_AUDIT='+report.status);
 console.log('TOOLS_TOTAL='+report.toolCount);
 for(const [group,names] of Object.entries(report.registryCandidates)){
  console.log('REGISTRY_'+group.toUpperCase()+'='+ (names.length?names.join(','):'NOT_EXPOSED'));
 }
 console.log('OTHER_READONLY_DISCOVERY='+report.discoveryCandidates.join(','));
 console.log('TOOLS_CALLED=0');
 console.log('REGISTRY_SNAPSHOT_TAKEN=NO');
 console.log('HA_WRITES=NO');
 console.log('PRODUCTION_CHANGED=NO');
}catch(e){
 console.log('HA_MCP_CAPABILITY_AUDIT=unavailable');
 console.log('REASON='+ (e?.message==='audit_timeout'?'timeout':'connection_or_manifest_error'));
 process.exitCode=1;
}finally{
 if(client)await client.close().catch(()=>{});
}
