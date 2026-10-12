// DEV-only opt-in execution boundary for new lights. No runtime integration by default.
// Separate trusted deployment approval AND verified physical IDs required.
import {RESPONDING_NEW_LIGHT_IDS} from './responding-new-light-batch.mjs';
const candidates=new Set(RESPONDING_NEW_LIGHT_IDS);
export function createNewLightDispatch({callTool,verifyAdmission,approvedIds=[],releaseEnabled=false}={}){
 const safeApproved=Array.isArray(approvedIds)&&approvedIds.every(id=>typeof id==='string'&&candidates.has(id))&&new Set(approvedIds).size===approvedIds.length?new Set(approvedIds):new Set();
 return Object.freeze({async dispatch({action}={}){
  const denied=reason=>({status:'denied',reason,actualWrite:false});
  if(releaseEnabled!==true)return denied('release_disabled');
  if(action?.name!=='ha_call_service'||action?.args?.domain!=='light'||
     !candidates.has(action.args?.entity_id)||!safeApproved.has(action.args?.entity_id)||
     !['turn_on','turn_off'].includes(action.args?.service)||
     Object.keys(action.args??{}).sort().join(',')!=='domain,entity_id,service')return denied('out_of_scope');
  if(typeof callTool!=='function'||typeof verifyAdmission!=='function')return denied('trusted_boundary_missing');
  let admission;
  try{admission=await verifyAdmission(structuredClone(action));}catch{return denied('approval_check_failed');}
  if(admission?.valid!==true)return denied('approval_not_verified');
  const id=action.args.entity_id;
  try{
   const before=await callTool('ha_get_state',{entity_id:id});
   const body=before?.structuredContent??before;const state=body?.data??body;
   if(before?.isError||state?.entity_id!==id||!['on','off'].includes(state?.state))return denied('preflight_unverified');
   const serviceResult=await callTool('ha_call_service',structuredClone(action.args));
   if(serviceResult?.isError===true)return {status:'unverified',reason:'service_error',actualWrite:true};
   // One dispatch maximum. Subsequent attempts read status only.
   const expected=action.args.service==='turn_on'?'on':'off';
   for(let n=0;n<4;n++){
    const read=await callTool('ha_get_state',{entity_id:id});
    const rb=read?.structuredContent??read;const value=rb?.data??rb;
    if(read?.isError===true||value?.entity_id!==id)break;
    if(value.state===expected)return {status:'verified',actualWrite:true};
   }
   return {status:'unverified',reason:'state_not_confirmed',actualWrite:true};
  }catch{return {status:'failed',reason:'mcp_failure_or_unknown_outcome',actualWrite:true};}
 }});
}
