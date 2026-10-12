import {createHash} from 'node:crypto';

// Offline consistency evidence only. Two identical passes do NOT prove an atomic
// snapshot or transport origin. Real read transport must be separately reviewed.
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value && typeof value==='object' && Object.getPrototypeOf(value)===Object.prototype){
  return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 }
 return value;
}
function digest(records,idKey){
 if(!Array.isArray(records))return null;
 const ids=new Set();
 const normalized=[];
 for(const item of records){
  const id=item?.[idKey];
  if(typeof id!=='string'||!id.trim()||ids.has(id)||!item||Array.isArray(item)||typeof item!=='object')return null;
  ids.add(id);normalized.push(item);
 }
 normalized.sort((a,b)=>a[idKey].localeCompare(b[idKey]));
 return createHash('sha256').update(JSON.stringify(canonical(normalized))).digest('hex');
}
export function assessTwoPassRegistry({first,second}={}){
 const deny=reason=>({stable:false,authorization:false,reason});
 if(!first||!second)return deny('missing_registry_pass');
 const hashes={};
 for(const [kind,id] of [['entities','entity_id'],['devices','id'],['areas','area_id']]){
  const left=digest(first[kind],id),right=digest(second[kind],id);
  if(!left||!right)return deny('invalid_or_duplicate_registry_member');
  if(left!==right)return deny('registry_changed_between_passes');
  hashes[kind]=left;
 }
 return {stable:true,authorization:false,status:'double_read_consistency_only',hashes};
}
