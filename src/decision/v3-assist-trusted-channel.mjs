import {createAssistIngressGuard} from './v3-assist-ingress-guard.mjs';
// Offline ingress seam: transport identity is fixed at construction by operator config.
// Payload cannot set satellite ID, authentication, or transport trust.
export function createAssistTrustedChannel({satelliteId,clock=Date.now,ttlMs=15000,maxSeen=256,replayStore}={}){
 if(typeof satelliteId!=='string'||!/^[a-zA-Z0-9_.:-]{1,100}$/.test(satelliteId))throw Error('invalid_channel_id');
 const guard=createAssistIngressGuard({knownSatellites:[satelliteId],clock,ttlMs,maxSeen});
 return Object.freeze({
  receive({eventId,issuedAt,transcript,...extra}={}){
   if(Object.keys(extra).length)return {accepted:false,reason:'untrusted_payload_fields'};
   // Validate ingress first; durable claim is the final one-way accept gate.
   // No live action path is attached.
   if(replayStore && typeof replayStore.claim!=='function')return {accepted:false,reason:'invalid_replay_store'};
   if(!replayStore)return {accepted:false,reason:'durable_replay_required'};
   const result=guard.receive({transportVerified:true,satelliteId,eventId,issuedAt,transcript});
   if(!result.accepted)return result;
   const claim=replayStore.claim(eventId);
   if(claim?.accepted!==true)return {accepted:false,reason:claim?.reason||'replay_store_failed'};
   return result;
  },
 });
}
