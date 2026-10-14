// Strict, one-area HA-MCP metadata read admission. This grants no HA writes.
import {buildNativeHAAreaCatalog} from './ha-native-area-catalog.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const plain=x=>typeof x==='string'&&/^[a-z0-9_]{1,100}$/.test(x);
const kind=x=>Array.isArray(x)?'array':obj(x)?'object':x===null?'null':typeof x;
export function admitAreaDeviceProbe({manifest,areaResponse}={}){
 const catalog=buildNativeHAAreaCatalog(areaResponse);
 if(catalog.status!=='complete_area_metadata')return {allowed:false,reason:'area_catalog_unverified'};
 if(!Array.isArray(manifest))return {allowed:false,reason:'manifest_unavailable'};
 const tool=manifest.filter(t=>t?.name==='ha_get_device');
 if(tool.length!==1)return {allowed:false,reason:'tool_missing_or_ambiguous'};
 const schema=tool[0].inputSchema;
 const property=schema?.properties?.area_id;
 if(schema?.type!=='object'||!obj(property)||!Array.isArray(property.anyOf)||
    !property.anyOf.some(t=>t?.type==='string')||
    !Array.isArray(schema?.required)&&schema?.required!==undefined||
    (schema?.required??[]).some(k=>k!=='area_id'))
  return {allowed:false,reason:'schema_unverified'};
 // Exactly one native area ID, not a user-provided ID or an arbitrary device.
 const selected=catalog.areas.find(a=>plain(a.area_id));
 if(!selected)return {allowed:false,reason:'no_verified_area'};
 return {allowed:true,tool:'ha_get_device',args:{area_id:selected.area_id},
  scope:'one_native_area',haWrites:false,authorizesRead:false,authorizesWrite:false};
}
const safeKey=x=>/^[a-z][a-z0-9_]{0,48}$/.test(x);
export function summarizeAreaDeviceProbe(raw){
 if(!obj(raw)||raw.isError===true)return {status:'unavailable'};
 const data=obj(raw.structuredContent)?raw.structuredContent:raw;
 if(!obj(data))return {status:'unavailable'};
 // Only field names/types/counts; exclude all values, entity IDs, room names.
 const fields=Object.entries(data).filter(([key])=>safeKey(key)).slice(0,24)
  .map(([key,v])=>({key,type:kind(v),...(Array.isArray(v)?{count:v.length}:{}),
   ...(Array.isArray(v)&&obj(v[0])?{recordKeys:Object.keys(v[0]).filter(safeKey).sort().slice(0,24)}:{})}));
 return {status:'shape_only',fields,authorizesRead:false,authorizesWrite:false};
}
