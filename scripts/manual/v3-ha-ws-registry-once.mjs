#!/usr/bin/env node
// Safe default: offline capabilities only, NO network or token reads.
// Explicit --read-only plus environment HA_CATALOG_WS_URL and
// HA_CATALOG_TOKEN required to access five native HA registry lists.
// Never logs secrets, entity names, identifiers or raw HA responses.
import {readCatalogViaHACoreWebSocket,checkHACatalogEndpoint} from '../../src/home/ha-ws-once-reader.mjs';
const requested=process.argv.slice(2);
if(requested.length===0||requested.length===1&&requested[0]==='--preflight'){
 console.log('HA_WS_PREFLIGHT=offline');
 console.log('NODE_WEBSOCKET_AVAILABLE='+(typeof globalThis.WebSocket==='function'?'YES':'NO'));
 console.log('CREDENTIALS_INSPECTED=NO');
 console.log('NETWORK_CALLS=0');
 console.log('HA_WRITES=0');
 console.log('PRODUCTION_CHANGED=NO');
}else if(requested.length===1&&requested[0]==='--read-only'){
 const status=checkHACatalogEndpoint(process.env.HA_CATALOG_WS_URL);
 if(status.status!=='approved_url'){
  console.log('HA_WS_READ=unavailable');
  console.log('REASON=endpoint_not_approved');
  process.exitCode=1;
 }else{
  const r=await readCatalogViaHACoreWebSocket({
   url:status.url,token:process.env.HA_CATALOG_TOKEN,
   WebSocketImpl:globalThis.WebSocket,timeoutMs:8000
  });
  console.log('HA_WS_READ='+r.status);
  if(r.status==='validated_snapshot'){
   for(const [key,value] of Object.entries(r.counts??{}))
    console.log('COUNT_'+key.toUpperCase()+'='+value);
  }else{
   console.log('REASON='+r.reason);
   process.exitCode=1;
  }
  console.log('READ_COMMANDS=5_MAX');
  console.log('HA_WRITES=0');
  console.log('PRODUCTION_CHANGED=NO');
 }
}else{
 console.log('USAGE=--preflight|--read-only');
 process.exitCode=2;
}
