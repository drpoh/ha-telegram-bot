import {normalizeV3Command,mayRequestV3Action} from "./v3-command-envelope.mjs";

// Offline fixture. In production, only a trusted Assist pipeline may provide
// the device id and transcript. This function does not authenticate transport.
export function createIsolatedAssistAdapter({knownSatellites=[],clock=Date.now}={}){
 const approved=new Set(knownSatellites);
 return Object.freeze({
  receive({satelliteId,transcript,claimedUserId,authenticated,issuedAt}={}){
   if(typeof satelliteId!=="string" || !approved.has(satelliteId) ||
      claimedUserId!=null || authenticated===true)
    return {accepted:false,reason:"untrusted_satellite_or_identity"};
   const result=normalizeV3Command({
    source:"assist",sourceId:satelliteId,text:transcript,
    actorId:null,authenticated:false,issuedAt:issuedAt??clock(),
   });
   if(!result.accepted)return result;
   return {accepted:true,command:result.command,authorization:"not_granted"};
  },
  eligibleForReview(command,{risk="low",requiresPersonalIdentity=false}={}){
   return command?.source==="assist" &&
    approved.has(command.sourceId) &&
    mayRequestV3Action(command,{risk,requiresPersonalIdentity});
  },
 });
}
