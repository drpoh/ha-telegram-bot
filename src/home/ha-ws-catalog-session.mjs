// DEV-only composition of existing native HA JS WebSocket catalog modules.
// The caller owns an already authenticated Connection and its lifecycle.
// No socket/token/process creation, registry writes, state reads or Telegram IO.
import {readHARegistrySnapshot} from './ha-ws-registry-loader.mjs';
import {createHACatalogCoordinator} from './ha-catalog-refresh-coordinator.mjs';
import {createHARegistryEventObserver} from './ha-ws-registry-event-observer.mjs';
const fail=reason=>Object.freeze({status:'unverified',reason,
 authorizesRead:false,authorizesWrite:false});
export function createHAReadOnlyCatalogSession({
 connection,timeoutMs=10000,debounceMs=1000,
 setTimeoutFn,clearTimeoutFn
}={}){
 if(typeof connection?.sendMessagePromise!=='function')throw Error('missing_ws_reader');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<500||timeoutMs>30000)
  throw Error('invalid_catalog_timeout');
 let stopped=false;
 const coordinator=createHACatalogCoordinator({
  fetchSnapshot:()=>readHARegistrySnapshot(connection,{timeoutMs})
 });
 const observer=createHARegistryEventObserver({
  connection,coordinator,debounceMs,setTimeoutFn,clearTimeoutFn
 });
 let starting=null;
 let started=false;
 return Object.freeze({
  async start(){
   if(stopped)return fail('session_stopped');
   if(started||starting)return fail('already_started');
   // Event listeners register before first snapshot to close subscribe/fetch gap.
   starting=observer.start();
   try{
    const result=await starting;
    started=true;
    return {status:'started',subscriptions:result.subscriptions,
     snapshotStatus:'pending',authorizesRead:false,authorizesWrite:false};
   }catch{return fail('subscription_failure');}
   finally{starting=null;}
  },
  getStatus(){
   if(stopped)return fail('session_stopped');
   const s=coordinator.getStatus();
   return Object.freeze({status:s.status,reason:s.reason,
    counts:s.status==='fresh'?s.coverage:null,
    subscriptions:observer.status().subscriptions,
    authorizesRead:false,authorizesWrite:false});
  },
  // Internal catalog data never grants permission to read states or operate devices.
  getVerifiedCatalog:()=>stopped?null:coordinator.getVerifiedCatalog(),
  async close(){
   if(stopped)return fail('session_stopped');
   stopped=true;
   await observer.stop();
   coordinator.stop();
   return {status:'closed',authorizesRead:false,authorizesWrite:false};
  }
 });
}
