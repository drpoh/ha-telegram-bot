import {resolveStageLight} from './v3-stage-target-resolution.mjs';
// Offline two-snapshot gate. Neither a match nor revalidation grants write authority.
const deny=reason=>({status:'denied',reason,authorized:false});
export function revalidateStageTarget({initialSnapshot,currentSnapshot,name,areaId,now=Date.now()}={}){
 const initial=resolveStageLight({snapshot:initialSnapshot,name,areaId,now});
 if(initial.status!=='candidate')return deny('initial_'+initial.reason);
 const current=resolveStageLight({snapshot:currentSnapshot,name:initial.entityId,areaId,now});
 if(current.status!=='candidate')return deny('current_'+current.reason);
 if(initial.entityId!==current.entityId||initial.deviceId!==current.deviceId||initial.areaId!==current.areaId)
  return deny('target_identity_changed');
 return {status:'candidate_revalidated',authorized:false,entityId:current.entityId,deviceId:current.deviceId,areaId:current.areaId};
}
