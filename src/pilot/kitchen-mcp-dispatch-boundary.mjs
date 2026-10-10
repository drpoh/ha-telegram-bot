import {verifyConfirmedLightResult} from '../decision/confirmed-result-verification.mjs';

// Separate pilot capability boundary: no MCP connection or production credentials here.
// A caller-supplied approval is deliberately insufficient: releaseEnabled must be
// provisioned by a separately reviewed deployment step, never Telegram or LLM.
export function createKitchenMcpDispatchBoundary({callTool,releaseEnabled=false,verifyAdmission}={}){
 return Object.freeze({
  async dispatch({action}={}){
   const deny=reason=>({status:'denied',reason});
   if(releaseEnabled!==true)return deny('live_release_disabled');
   if(typeof verifyAdmission!=='function')return deny('missing_trusted_admission');
   if(action?.name!=='ha_call_service'||action.args?.domain!=='light'||
      action.args?.entity_id!=='light.led_kukhnia'||
      !['turn_on','turn_off'].includes(action.args?.service)||
      Object.keys(action.args).sort().join(',')!=='domain,entity_id,service')return deny('out_of_scope');
   if(typeof callTool!=='function')return deny('mcp_unavailable');
   try{if((await verifyAdmission(structuredClone(action)))?.valid!==true)return deny('approval_not_verified');}
   catch{return deny('approval_check_failed');}
   try{
    const args=structuredClone(action.args);
    const before=await callTool('ha_get_state',{entity_id:args.entity_id});
    const state=(before?.structuredContent??before)?.data??(before?.structuredContent??before);
    if(state?.entity_id!==args.entity_id||!['on','off'].includes(state.state))return deny('preflight_state_unverified');
    const result=await callTool('ha_call_service',args);
    let checked=await verifyConfirmedLightResult({action,serviceResult:result,readState:id=>callTool('ha_get_state',{entity_id:id})});
    // A Zigbee state transition may be delayed. Retry READS only, never the write.
    for(let attempt=0;attempt<3&&!checked.verified&&checked.status==='state_pending';attempt++){
     await new Promise(resolve=>setTimeout(resolve,750));
     checked=await verifyConfirmedLightResult({action,serviceResult:result,readState:id=>callTool('ha_get_state',{entity_id:id})});
    }
    return {status:checked.verified?'verified':'unverified',reason:checked.status};
   }catch{return {status:'failed',reason:'mcp_call_failed'};}
  }
 });
}
