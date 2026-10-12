import {createV3IntentLedger} from '../decision/v3-intent-ledger.mjs';
import {resolveStageLight} from '../decision/v3-stage-target-resolution.mjs';
// Strictly offline staged confirmation. No Home Assistant imports or dispatcher.
export function createStageConsentSimulation({clock=Date.now}={}){
 const ledger=createV3IntentLedger({clock});
 const deny=reason=>({status:'denied',reason,authorized:false,actualWrite:false});
 return Object.freeze({
  issue({actor,name,areaId,initialSnapshot}={}){
   if(!Number.isSafeInteger(actor?.userId)||actor.userId<=0||actor.chatId!==actor.userId)
    return deny('invalid_actor');
   const target=resolveStageLight({snapshot:initialSnapshot,name,areaId,now:clock()});
   if(target.status!=='candidate')return deny(target.reason);
   const issue=ledger.issue({...actor,userText:name,action:{name:'stage_candidate_only',args:{entityId:target.entityId,deviceId:target.deviceId,areaId:target.areaId,name}},ttlMs:60000});
   return {status:'pending',token:issue.token,expiresAt:issue.expiresAt,authorized:false,actualWrite:false};
  },
  confirm({actor,token,currentSnapshot}={}){
   if(!Number.isSafeInteger(actor?.userId)||actor.userId<=0||actor.chatId!==actor.userId)return deny('invalid_actor');
   const record=ledger.consume({...actor,token});
   if(!record)return deny('missing_expired_or_used_intent');
   const {entityId,deviceId,areaId}=record.action.args;
   const result=resolveStageLight({snapshot:currentSnapshot,name:entityId,areaId,now:clock()});
   if(result.status!=='candidate')return deny(result.reason);
   if(result.deviceId!==deviceId)return deny('target_identity_changed');
   return {status:'simulated',authorized:false,actualWrite:false,entityId};
  },
 });
}
