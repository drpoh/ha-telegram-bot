#!/usr/bin/env node
// Operator-only full HA-MCP light-domain discovery. READ ONLY, never an actuation allowlist.
// No Telegram polling, disk snapshot, HA service call, registry mutation or authorization.
// HA search completeness is required; truncated/partial lists are denied, not silently accepted.
import {readFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {inspectKitchenLanEndpoint} from '../../src/pilot/kitchen-lan-endpoint-policy.mjs';
import {summarizeDiscoveredLights} from '../../src/home/discovered-lights-overview.mjs';

if(process.argv.slice(2).join(' ')!=='--readonly --operator-approved'){
 console.error('USAGE: node scripts/manual/v3-all-lights-readonly-inventory.mjs --readonly --operator-approved');
 process.exitCode=2;
}else{
 let client;
 try{
  const raw=readFileSync('/home/drpoh/.config/rs-home-ai-v3/mcp-url','utf8').trim();
  const endpoint=inspectKitchenLanEndpoint(raw,{ownerApprovedLanHttpPilot:true});
  if(!endpoint.allowed)throw Error('endpoint_denied');
  client=new Client({name:'rs-home-ai-v3-manual-all-lights-inventory',version:'0.1.0'});
  await client.connect(new StreamableHTTPClientTransport(endpoint.url,{
   fetch:(input,init)=>fetch(input,{...init,redirect:'error'}),
   requestInit:{redirect:'error'}
  }));
  const report=await summarizeDiscoveredLights({
   maxEntities:500,timeoutMs:20000,includeHidden:true,
   readTool:(name,args)=>{
    if(name!=='ha_search'||args?.domain_filter!=='light'||args.include_hidden!==true||
       args.limit!==500||args.query!==''||args.result_fields?.join(',')!=='entity_id,domain,state')
      throw Error('read_scope_denied');
    return client.callTool({name:'ha_search',arguments:args});
   }
  });
  if(report.authorization!==false||report.actualWrite!==false)throw Error('authorization_invariant');
  console.log('ALL_LIGHTS_READONLY_STATUS='+report.status);
  if(report.status==='unavailable'){
   console.log('ALL_LIGHTS_INVENTORY=unverified_or_incomplete');
   process.exitCode=1;
  }else{
   console.log('ALL_LIGHTS_COUNT='+report.checked);
   console.log('ALL_LIGHTS_COUNTS='+JSON.stringify({
    on:report.on.length,off:report.off.length,unknown:report.unknown.length
   }));
   for(const id of report.on)console.log('LIGHT_ENTITY '+id+' on');
   for(const id of report.off)console.log('LIGHT_ENTITY '+id+' off');
   for(const item of report.unknownDetails){
    console.log('LIGHT_ENTITY '+item.id+' unknown '+item.reason);
   }
   console.log('ALL_LIGHTS_SCOPE=HA_SEARCH_LIGHT_DOMAIN_INCLUDING_HIDDEN');
   console.log('ALL_LIGHTS_PHYSICAL_IDENTITY=unverified');
   console.log('ALL_LIGHTS_WRITE_AUTHORIZATION=false');
   process.exitCode=report.status==='complete'?0:1;
  }
 }catch{
  // Never expose private endpoint, credentials, transport exceptions or raw HA data.
  console.error('ALL_LIGHTS_READONLY_STATUS=read_failed');
  process.exitCode=1;
 }finally{
  if(client)await client.close().catch(()=>{});
 }
}
