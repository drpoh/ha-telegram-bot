// Read-only migration proposal. Stable identifiers are evidence, never permission
// to rewrite Home Assistant, policy, memory or reviewed classification.
function normalized(items) {
 if(!Array.isArray(items))throw Error("invalid_inventory");
 const byId=new Map(),byStable=new Map();
 for(const item of items){
  const entityId=item?.entity_id,uniqueId=item?.unique_id,platform=item?.platform;
  if(typeof entityId!=="string" || !/^[a-z_]+\.[a-z0-9_]+$/.test(entityId) ||
     byId.has(entityId))throw Error("invalid_entity_inventory");
  byId.set(entityId,item);
  if(typeof uniqueId==="string" && uniqueId.trim() && typeof platform==="string" && platform.trim()){
   const key=JSON.stringify([platform,uniqueId]);
   if(!byStable.has(key))byStable.set(key,[]);
   byStable.get(key).push(item);
  }
 }
 return {byId,byStable};
}
export function proposeEntityRenames({before,after}={}){
 const old=normalized(before),current=normalized(after);
 const proposals=[],unresolved=[];
 for(const [oldId,entity] of old.byId){
  if(current.byId.has(oldId))continue;
  const stable=typeof entity?.unique_id==="string" && entity.unique_id.trim() &&
    typeof entity?.platform==="string" && entity.platform.trim()
      ? JSON.stringify([entity.platform,entity.unique_id]):null;
  const matches=stable?current.byStable.get(stable)||[]:[];
  // Same domain + exact same platform and unique_id. Never fuzzy-match names.
  const valid=matches.filter(x=>x.entity_id.split(".")[0]===oldId.split(".")[0]);
  if(valid.length===1 && !old.byId.has(valid[0].entity_id)){
   proposals.push({old_entity_id:oldId,new_entity_id:valid[0].entity_id,
    status:"review_required",evidence:"platform_unique_id_same_domain"});
  }else unresolved.push({entity_id:oldId,status:valid.length>1?"ambiguous":"unresolved"});
 }
 return {status:"read_only",proposals,unresolved,automatic_changes:0};
}
