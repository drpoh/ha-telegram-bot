// Offline HA-MCP inventory assessment. Returned candidates NEVER grant read/write authority.
// Input is an operator-provided ha_search result, not a network client or a trusted registry.
export const INVENTORY_DOMAINS=Object.freeze(['light','switch','sensor','binary_sensor']);
const MAX=500;
const validId=(id,domain)=>typeof id==='string'&&id.startsWith(domain+'.')&&/^[a-z0-9_]+$/.test(id.slice(domain.length+1));
export function assessReadonlyInventory({domain,result}={}){
 const fail=reason=>({status:'unverified',reason,authorization:false,actualWrite:false,candidates:[]});
 if(!INVENTORY_DOMAINS.includes(domain))return fail('unsupported_domain');
 const raw=result?.structuredContent??result;
 if(result?.isError===true||raw?.success!==true||raw?.partial!==false||
    raw?.entity_has_more!==false||!Number.isInteger(raw?.entity_total_matches)||
    raw.entity_total_matches<0||raw.entity_total_matches>MAX||
    !Array.isArray(raw.entities)||raw.entities.length!==raw.entity_total_matches)return fail('incomplete_inventory');
 const seen=new Set(), candidates=[];
 for(const item of raw.entities){
  if(!validId(item?.entity_id,domain)||item.domain!==domain||seen.has(item.entity_id))
   return fail('invalid_or_duplicate_entity');
  seen.add(item.entity_id);
  // No friendly_name, device, area or physical-light classification inference.
  candidates.push(Object.freeze({entity_id:item.entity_id,domain,review:'unclassified'}));
 }
 return {status:'complete',reason:null,authorization:false,actualWrite:false,count:candidates.length,candidates};
}
