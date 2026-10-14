// Read-only catalog refresh coordinator. HA remains authoritative.
// Caller supplies a fetchSnapshot callback (e.g. injected native WS loader).
// No networking, subscriptions, process startup, credentials or HA writes.
import {createRegistryFreshness} from './ha-ws-registry-freshness.mjs';
const validSnapshot=x=>x?.status==='validated_snapshot'&&x.complete===true&&
 x.counts&&Array.isArray(x.entities)&&x.entities.length===x.counts.entities&&
 x.authorizesRead===false&&x.authorizesWrite===false;
const safeState=(status,reason,coverage=null)=>Object.freeze({
 status,reason,coverage,authorizesRead:false,authorizesWrite:false
});
export function createHACatalogCoordinator({fetchSnapshot}={}){
 if(typeof fetchSnapshot!=='function')throw Error('missing_reader');
 const freshness=createRegistryFreshness();
 let catalog=null;
 let serial=0;
 let stopped=false;
 let active=null;
 const invalid=reason=>safeState('stale',reason,null);
 const summarize=()=>{
  if(stopped)return invalid('stopped');
  if(!catalog||!freshness.status().fresh)return invalid('refresh_required');
  return safeState('fresh','validated_snapshot',Object.freeze({...catalog.counts}));
 };
 async function refresh(){
  if(stopped)return invalid('stopped');
  if(active)return active;
  const expectedSerial=serial;
  // Immediately treat existing catalog as stale while refreshing. An incoming
  // registry event invalidates this flight even if it resolves successfully.
  freshness.disconnected();
  const job=(async()=>{
   let snapshot;
   try{snapshot=await fetchSnapshot();}
   catch{return invalid('read_failure');}
   if(stopped||serial!==expectedSerial)return invalid('concurrent_change');
   if(!validSnapshot(snapshot))return invalid('unverified_snapshot');
   catalog=snapshot;
   freshness.markSnapshotValid();
   return summarize();
  })();
  active=job;
  try{return await job;}finally{if(active===job)active=null;}
 }
 const markChange=type=>{
  if(stopped)return invalid('stopped');
  serial++;
  freshness.observeEvent(type);
  return summarize();
 };
 return Object.freeze({
  refresh,
  changed:markChange,
  disconnected(){
   if(stopped)return invalid('stopped');
   serial++;
   freshness.disconnected();
   return summarize();
  },
  getStatus:summarize,
  getVerifiedCatalog(){
   if(stopped||!freshness.status().fresh)return null;
   return catalog;
  },
  stop(){
   stopped=true;
   serial++;
   catalog=null;
   freshness.disconnected();
   return invalid('stopped');
  }
 });
}
