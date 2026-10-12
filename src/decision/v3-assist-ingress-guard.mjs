import {createIsolatedAssistAdapter} from './v3-isolated-assist-adapter.mjs';
// Offline trusted-transport fixture only. An untrusted payload cannot certify its own provenance.
export function createAssistIngressGuard({knownSatellites=[],clock=Date.now,ttlMs=15000,maxSeen=256}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1||!Number.isSafeInteger(maxSeen)||maxSeen<1)throw Error('invalid_ingress_config');
 const adapter=createIsolatedAssistAdapter({knownSatellites,clock});
 const seen=new Map();
 return Object.freeze({
  receive({transportVerified=false,satelliteId,transcript,eventId,issuedAt,claimedUserId,authenticated}={}){
   const now=clock();
   if(transportVerified!==true)return {accepted:false,reason:'unverified_transport'};
   if(typeof eventId!=='string'||!/^[a-zA-Z0-9_.:-]{8,128}$/.test(eventId)||
     !Number.isSafeInteger(issuedAt)||issuedAt>now||now-issuedAt>ttlMs)
    return {accepted:false,reason:'invalid_or_stale_event'};
   if(seen.has(eventId))return {accepted:false,reason:'replayed_event'};
   const result=adapter.receive({satelliteId,transcript,issuedAt,claimedUserId,authenticated});
   if(!result.accepted)return result;
   for(const [key,time] of seen)if(now-time>ttlMs)seen.delete(key);
   if(seen.size>=maxSeen)return {accepted:false,reason:'replay_capacity_exhausted'};
   seen.set(eventId,now);
   return {...result,authorization:'not_granted'};
  },
 });
}
