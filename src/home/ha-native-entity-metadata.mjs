// Normalize a single explicitly requested HA-MCP entity_entry, using verified
// native 'area' and 'label_names' fields. Metadata is NEVER authorization.
import {buildNativeHAAreaCatalog} from './ha-native-area-catalog.mjs';
const norm=x=>typeof x==='string'?x.trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е'):'';
const safeEntity=x=>typeof x==='string'&&/^[a-z0-9_]+\.[a-z0-9_]+$/.test(x);
const safeDevice=x=>typeof x==='string'&&/^[a-z0-9]{8,64}$/.test(x);
const labels=new Map([
 ['освещение','lighting'],['свет','lighting'],['lighting','lighting'],
 ['управление','control'],['control','control'],
 ['системный','system'],['системные','system'],['system','system']
]);
const rejected=reason=>({status:'unverified',reason,entity:null,authorizesRead:false,authorizesWrite:false});
export function normalizeNativeHAEntity({areaResponse,entityResponse,expectedEntityId,knownDevices=[]}={}){
 if(!safeEntity(expectedEntityId))return rejected('unreviewed_id');
 const areaCatalog=buildNativeHAAreaCatalog(areaResponse);
 if(areaCatalog.status!=='complete_area_metadata')return rejected('area_catalog_unverified');
 if(entityResponse?.isError===true||entityResponse?.structuredContent?.success!==true)
  return rejected('entity_query_failed');
 const e=entityResponse.structuredContent.entity_entry;
 if(!e||typeof e!=='object'||Array.isArray(e)||e.entity_id!==expectedEntityId)
  return rejected('entity_identity_mismatch');
 if(e.enabled===false||e.hidden===true||e.disabled_by!=null||e.hidden_by!=null)
  return rejected('hidden_or_disabled');
 if(!Array.isArray(e.label_names)||e.label_names.some(n=>typeof n!=='string'))
  return rejected('label_names_missing');
 // Resolve an entity area ID first; next try the *native entity display area*
 // only when it uniquely matches a native area or an explicit alias.
 let area=null;
 if(e.area_id!=null){
  area=areaCatalog.areas.find(a=>a.area_id===e.area_id);
  if(!area)return rejected('unknown_explicit_area');
 }else if(typeof e.area==='string'&&e.area.trim()){
  const choices=areaCatalog.areas.filter(a=>norm(a.name)===norm(e.area)||a.aliases.some(x=>norm(x)===norm(e.area)));
  if(choices.length!==1)return rejected('ambiguous_display_area');
  area=choices[0];
 }else if(safeDevice(e.device_id)){
  const matching=knownDevices.filter(d=>d?.device_id===e.device_id);
  if(matching.length>1)return rejected('ambiguous_device');
  if(matching.length===1){
   area=areaCatalog.areas.find(a=>a.area_id===matching[0].area_id);
   if(!area)return rejected('device_area_unverified');
  }
 }
 const recognized=[...new Set(e.label_names.map(x=>labels.get(norm(x))).filter(Boolean))];
 const category=recognized.length===1?recognized[0]:recognized.length?'ambiguous':'unclassified';
 return {status:'scoped_entity_metadata',entity:{
  entityId:expectedEntityId,areaId:area?.area_id??null,areaName:area?.name??null,
  category,categorySource:'ha_mcp_label_names',labelCount:e.label_names.length,
  deviceId:safeDevice(e.device_id)?e.device_id:null,
  domain:expectedEntityId.split('.')[0],reviewRequired:true,
  authorizedForAction:false
 },registryComplete:false,authorizesRead:false,authorizesWrite:false};
}
