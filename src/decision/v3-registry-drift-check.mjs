import {createHash} from "node:crypto";

// Pure, read-only, fail-closed registry evidence; never a permission grant.
export function normalizeLightingRegistry({entities,devices,areas,groupMembers}={}){
 const deny=reason=>({ok:false,reason});
 if(!Array.isArray(entities)||!Array.isArray(devices)||!Array.isArray(areas)||!Array.isArray(groupMembers))return deny("incomplete_registry");
 // Registry identity collisions must fail closed, not be hidden by Map/Set.
 const validId=x=>typeof x==="string"&&x.length>0;
 const deviceIds=devices.map(x=>x?.id);
 const areaIdList=areas.map(x=>x?.id);
 if(!deviceIds.every(validId)||new Set(deviceIds).size!==deviceIds.length)
  return deny("invalid_or_duplicate_device");
 if(!areaIdList.every(validId)||new Set(areaIdList).size!==areaIdList.length)
  return deny("invalid_or_duplicate_area");
 const deviceMap=new Map(devices.map(x=>[x.id,x]));
 const areaIds=new Set(areaIdList);
 const entityIds=entities.map(x=>x?.entity_id);
 if(!entityIds.every(x=>typeof x==="string"&&/^[a-z0-9_]+\.[a-z0-9_]+$/.test(x))||new Set(entityIds).size!==entityIds.length)
  return deny("invalid_or_duplicate_entity");
 const light=entities.filter(x=>x.entity_id.startsWith("light."));
 if(groupMembers.length===0||new Set(groupMembers).size!==groupMembers.length||!groupMembers.every(x=>typeof x==="string"&&x.startsWith("light.")))return deny("invalid_group_members");
 const group=light.find(x=>x.entity_id==="light.ves_svet");
 if(!group||group.platform!=="group")return deny("wrong_group_identity");
 const records=[];
 for(const x of light){
  const device=x.device_id?deviceMap.get(x.device_id):null;
  if(x.device_id&&!device)return deny("missing_device");
  const area=x.area_id||device?.area_id||null;
  if(area&&!areaIds.has(area))return deny("unknown_area");
  records.push({id:x.entity_id,platform:x.platform||null,area,disabled:!!x.disabled_by,name:x.name||x.original_name||null});
 }
 records.sort((a,b)=>a.id.localeCompare(b.id));
 const members=[...groupMembers].sort();
 const binding={version:1,records,group:{entity_id:"light.ves_svet",members}};
 const sha256=createHash("sha256").update(JSON.stringify(binding)).digest("hex");
 return {ok:true,sha256,binding,authorization:false};
}
export function verifyLightingRegistryDigest(snapshot,expectedSha256){
 if(!snapshot?.ok||typeof expectedSha256!=="string"||!/^[a-f0-9]{64}$/.test(expectedSha256))
  return {valid:false,reason:"missing_evidence_or_pin",authorization:false};
 return {valid:snapshot.sha256===expectedSha256,reason:snapshot.sha256===expectedSha256?"evidence_unchanged":"registry_changed",authorization:false};
}
