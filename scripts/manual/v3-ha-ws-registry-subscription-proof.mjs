#!/usr/bin/env node
// No network by default. --read-only requires owner-supplied private env token.
import {probeHARegistrySubscriptions} from '../../src/home/ha-ws-registry-subscription-proof.mjs';
import {checkHACatalogEndpoint} from '../../src/home/ha-ws-once-reader.mjs';
const args=process.argv.slice(2);
if(args.length===0||args.length===1&&args[0]==='--preflight'){
 console.log('REGISTRY_EVENTS_PREFLIGHT=offline');
 console.log('NETWORK_CALLS=0');
 console.log('TOKEN_INSPECTED=NO');
 console.log('HA_WRITES=0');
}else if(args.length===1&&args[0]==='--read-only'){
 if(checkHACatalogEndpoint(process.env.HA_CATALOG_WS_URL).status!=='approved_url'){
  console.log('REGISTRY_EVENTS=unverified');
  console.log('REASON=endpoint_denied');
  process.exitCode=1;
 }else{
  const r=await probeHARegistrySubscriptions({
   url:process.env.HA_CATALOG_WS_URL,
   token:process.env.HA_CATALOG_TOKEN,WebSocketImpl:globalThis.WebSocket,
   timeoutMs:12000,observeMs:1500
  });
  console.log('REGISTRY_EVENTS='+r.status);
  console.log('REASON='+r.reason);
  console.log('SUBSCRIPTIONS_ACCEPTED='+r.subscriptions);
  if(r.rejectedType)console.log('REJECTED_TYPE='+r.rejectedType);
  for(const e of r.eventCounts??[])
   console.log('EVENT='+e.type+' COUNT='+e.count);
  console.log('HA_WRITES=0');
  if(r.status!=='subscribed')process.exitCode=1;
 }
}else{
 console.log('USAGE=--preflight|--read-only');process.exitCode=2;
}
console.log('PRODUCTION_CHANGED=NO');
