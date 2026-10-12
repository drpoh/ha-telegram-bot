// Explicit human-selected DEV read-only lighting manifest. No HA access or action grant.
// The operator must choose exact candidate IDs; do not bulk-import unavailable entities.
import {NEW_LIGHT_CANDIDATES} from './new-light-candidates.mjs';
const byId=new Map(NEW_LIGHT_CANDIDATES.map(x=>[x.id,x]));
export function selectManualLights(ids){
 const invalid={status:'invalid',authorization:false,actualWrite:false,targets:[]};
 if(!Array.isArray(ids)||ids.length===0||ids.length>19||new Set(ids).size!==ids.length)return invalid;
 const targets=[];
 for(const id of ids){
  if(typeof id!=='string'||id.startsWith('light.browser_mod')||!byId.has(id))return invalid;
  const c=byId.get(id);
  targets.push(Object.freeze({id:c.id,area:c.area,label:c.label,readOnly:true,review:'pending_physical_identity'}));
 }
 return {status:'selected_for_review',authorization:false,actualWrite:false,targets:Object.freeze(targets)};
}
