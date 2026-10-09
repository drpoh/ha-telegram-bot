import {createAssistIngressGuard} from './v3-assist-ingress-guard.mjs';
// Offline ingress seam: transport identity is fixed at construction by operator config.
// Payload cannot set satellite ID, authentication, or transport trust.
export function createAssistTrustedChannel({satelliteId,clock=Date.now,ttlMs=15000,maxSeen=256}={}){
 if(typeof satelliteId!=='string'||!/^[a-zA-Z0-9_.:-]{1,100}$/.test(satelliteId))throw Error('invalid_channel_id');
 const guard=createAssistIngressGuard({knownSatellites:[satelliteId],clock,ttlMs,maxSeen});
 return Object.freeze({
  receive({eventId,issuedAt,transcript,...extra}={}){
   if(Object.keys(extra).length)return {accepted:false,reason:'untrusted_payload_fields'};
   return guard.receive({transportVerified:true,satelliteId,eventId,issuedAt,transcript});
  },
 });
}
