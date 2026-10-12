// DEV-only request planning. No MCP call, Telegram handler or action grant.
// A matching request is a pending proposal, never permission to execute.
import {selectManualLights} from './manual-light-selection.mjs';
const DEFAULT_DENIAL=Object.freeze({status:'denied',authorization:false,actualWrite:false});
export function planManualLightAction({entityId,action,ownerSelectedIds=[],physicalIdentityConfirmedIds=[]}={}){
 if(!['on','off'].includes(action)||typeof entityId!=='string'||
    entityId.startsWith('light.browser_mod')||
    !Array.isArray(physicalIdentityConfirmedIds))return DEFAULT_DENIAL;
 const selected=selectManualLights(ownerSelectedIds);
 if(selected.status!=='selected_for_review'||!selected.targets.some(t=>t.id===entityId)||
    !physicalIdentityConfirmedIds.includes(entityId))return DEFAULT_DENIAL;
 return Object.freeze({
  status:'pending_confirmation',authorization:false,actualWrite:false,
  entityId,action,requires:'/confirm',verification:'read_current_state_after_dispatch',
  note:'DEV proposal only; production authorization and execution require separate owner approval'
 });
}
