// Human-review evidence only. Never resolves authorization or guesses physical devices.
// Accepts only the fixed entity_ids from the already-reviewed read-only pilot.
import {LIGHT_OVERVIEW_IDS} from './light-overview.mjs';
const allowed=new Set(LIGHT_OVERVIEW_IDS);
const safeName=value=>{
 if(typeof value!=='string')return 'не указано';
 const normalized=value.replace(/[\r\n\t\x00-\x1f\x7f]/g,' ').trim();
 return normalized.slice(0,80)||'не указано';
};
export function describeScopedLightIdentity(id,result){
 if(!allowed.has(id))return {status:'scope_denied',text:'LIGHT_IDENTITY_DENIED'};
 if(result?.isError===true)return {status:'mcp_error',text:'LIGHT_IDENTITY '+id+' mcp_error'};
 const envelope=result?.structuredContent??result;
 const record=envelope?.data??envelope;
 if(record?.entity_id!==id)return {status:'identity_mismatch',text:'LIGHT_IDENTITY '+id+' identity_mismatch'};
 const state=record.state;
 if(!['on','off','unavailable','unknown'].includes(state))return {status:'invalid_state',text:'LIGHT_IDENTITY '+id+' invalid_state'};
 const name=safeName(record.attributes?.friendly_name);
 // HA friendly_name is metadata for review, not proof of physical type or area.
 return {status:state,text:'LIGHT_IDENTITY '+id+' state='+state+' friendly_name='+JSON.stringify(name)};
}
