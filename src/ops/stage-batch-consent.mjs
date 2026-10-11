import {createV3IntentLedger} from '../decision/v3-intent-ledger.mjs';
import {resolveStageLight} from '../decision/v3-stage-target-resolution.mjs';
// Mock-only all-or-nothing batch. Never imports or invokes any HA client.
export function createStageBatchConsent({clock=Date.now}={}){
 const ledger=createV3IntentLedger({clock});
 const deny=reason=>({status:'denied',reason,authorized:false,actualWrite:false});
 const actorValid=a=>Number.isSafeInteger(a?.userId)&&a.userId>0&&a.chatId===a.userId;
 const resolveAll=(requests,snapshot)=>{
  if(!Array.isArray(requests)||requests.length<2||requests.length>12)return {reason:'invalid_batch_size'};
  const ids=new Set(),results=[];
  for(const item of requests){
   const r=resolveStageLight({snapshot,name:item?.name,areaId:item?.areaId,now:clock()});
   if(r.status!=='candidate')return {reason:r.reason};
   if(ids.has(r.entityId))return {reason:'duplicate_target'};
   ids.add(r.entityId);results.push({entityId:r.entityId,deviceId:r.deviceId,areaId:r.areaId});
  }
  return {results};
 };
 return Object.freeze({
  issue({actor,requests,snapshot}={}){
   if(!actorValid(actor))return deny('invalid_actor');
   const r=resolveAll(requests,snapshot);
   if(!r.results)return deny(r.reason);
   const intent=ledger.issue({...actor,userText:'stage batch',action:{name:'stage_batch_candidate_only',args:{targets:r.results}},ttlMs:60000});
   return {status:'pending',token:intent.token,authorized:false,actualWrite:false};
  },
  cancel({actor,token}={}){
   if(!actorValid(actor))return false;
   return ledger.consume({...actor,token})!==null;
  },
  confirm({actor,token,snapshot}={}){
   if(!actorValid(actor))return deny('invalid_actor');
   const intent=ledger.consume({...actor,token});if(!intent)return deny('missing_expired_or_used_intent');
   const original=intent.action.args.targets;
   const nowTargets=resolveAll(original.map(x=>({name:x.entityId,areaId:x.areaId})),snapshot);
   if(!nowTargets.results)return deny(nowTargets.reason);
   if(original.some((x,i)=>x.entityId!==nowTargets.results[i].entityId||x.deviceId!==nowTargets.results[i].deviceId||x.areaId!==nowTargets.results[i].areaId))return deny('target_identity_changed');
   return {status:'simulated',authorized:false,actualWrite:false,entityIds:original.map(x=>x.entityId)};
  }
 });
}
