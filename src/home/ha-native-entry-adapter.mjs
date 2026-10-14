// Pure interpretation of HA-MCP entity_entry; never authorizes commands.
const norm=x=>typeof x==='string'?x.trim().toLowerCase().replace(/ё/g,'е'):'';
const types=new Map([['освещение','lighting'],['управление','control'],['системный','system']]);
export function inspectNativeEntry(reply,{entityId,areas=[],devices=[],labels=[]}={}){
 const data=reply?.structuredContent;
 const entry=data?.entity_entry;
 const fail=reason=>({status:'unverified',reason,authorization:false});
 if(reply?.isError||data?.success!==true||!entry||entry.entity_id!==entityId||data.entity_id!==entityId)
  return fail('identity_mismatch');
 if(entry.enabled===false||entry.hidden===true||entry.disabled_by!=null||entry.hidden_by!=null)
  return fail('disabled_or_hidden');
 if(!Array.isArray(areas)||!Array.isArray(devices)||!Array.isArray(labels))
  return fail('invalid_catalog');
 const dev=devices.find(x=>x.device_id===entry.device_id);
 const direct=entry.area_id??null;
 const inherited=dev?.area_id??null;
 let areaId=direct??inherited;
 if(!areaId&&entry.area){
  const matches=areas.filter(x=>norm(x.name)===norm(entry.area)||
   x.aliases?.some(a=>norm(a)===norm(entry.area)));
  if(matches.length>1)return fail('ambiguous_area');
  if(matches.length===1)areaId=matches[0].area_id;
 }
 const room=areas.find(x=>x.area_id===areaId);
 if(areaId&&!room)return fail('unknown_area');
 const fromIds=(Array.isArray(entry.labels)?entry.labels:[])
  .map(id=>labels.find(l=>l.label_id===id)?.name).filter(Boolean);
 const fromNames=(Array.isArray(entry.label_names)?entry.label_names:[])
  .filter(x=>typeof x==='string');
 const recognized=[...new Set([...fromIds,...fromNames].map(x=>types.get(norm(x))).filter(Boolean))];
 const unresolved=(Array.isArray(entry.labels)?entry.labels:[])
  .filter(id=>!labels.some(l=>l.label_id===id));
 const category=unresolved.length?'unclassified':recognized.length===1?recognized[0]:
  recognized.length>1?'ambiguous':'unclassified';
 return {status:'scoped',entityId,areaId:room?.area_id??null,areaName:room?.name??null,
  areaSource:direct?'entity':inherited?'device':room?'name':'unassigned',
  category,unresolvedLabelCount:unresolved.length,
  readApproved:false,actionApproved:false,authorization:false,
  completeRegistry:false};
}
