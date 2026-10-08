import {planLightIdentification} from "./light-identify-plan.mjs";

// Pure offline state-machine. Caller supplies elapsed time; NO timers or HA calls.
// Commands are descriptions only, never performed by this module.
export function createLightIdentifyController(){
 let session=null;
 const snapshot=()=>session?{status:session.status,entityId:session.plan.entityId,
  nextIndex:session.nextIndex,startedAt:session.startedAt}: {status:"idle"};
 const restore=(reason)=>{
  if(!session || session.status!=="running")return {ok:false,reason:"not_running"};
  session.status="restoring";
  return {ok:true,reason,command:{entityId:session.plan.entityId,
   desiredState:session.plan.initialState},status:"restore_required"};
 };
 return Object.freeze({
  status:snapshot,
  start({nowMs,approved=false,...options}={}){
   if(session)return {ok:false,reason:"busy"};
   if(approved!==true)return {ok:false,reason:"approval_required"};
   if(!Number.isSafeInteger(nowMs) || nowMs<0)return {ok:false,reason:"invalid_clock"};
   const plan=planLightIdentification(options);
   if(!plan.ready)return {ok:false,reason:plan.reason};
   session={plan,status:"running",startedAt:nowMs,nextIndex:0};
   return {ok:true,status:"running",plan};
  },
  poll({nowMs}={}){
   if(!session || session.status!=="running")return {ok:false,reason:"not_running"};
   if(!Number.isSafeInteger(nowMs)||nowMs<session.startedAt)return restore("clock_invalid");
   const elapsed=nowMs-session.startedAt;
   if(elapsed>=session.plan.durationMs)return restore("deadline");
   const step=session.plan.operations[session.nextIndex];
   if(!step || step.atMs>elapsed)return {ok:true,status:"waiting"};
   // Emit no more than one operation per poll, never catch up missed toggles.
   if(elapsed>step.atMs+session.plan.intervalMs)
    return restore("missed_schedule");
   session.nextIndex++;
   return {ok:true,status:"step",command:{entityId:session.plan.entityId,
    desiredState:step.desiredState}};
  },
  stop(){return restore("operator_stop");},
  fail(){return restore("write_or_read_failure");},
  finishRestore({succeeded=false}={}){
   if(!session || session.status!=="restoring")return {ok:false,reason:"no_restore_pending"};
   const result={ok:succeeded===true,status:succeeded===true?"restored":"restore_unverified"};
   session=null;
   return result;
  },
 });
}
