// Pure page-by-page read-only device inventory audit for known HA areas.
// Distinguish area-scoped device coverage from the full Home Assistant registry.
import {buildNativeHAAreaCatalog} from './ha-native-area-catalog.mjs';
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
export const AREA_CENSUS_LIMITS=Object.freeze({pageSize:50,maxPagesPerArea:8,maxAreas:25,maxTotalCalls:201});

export function inspectDeviceListAdmission(manifest){
 if(!Array.isArray(manifest))return false;
 const tools=manifest.filter(x=>x?.name==='ha_get_device');
 if(tools.length!==1)return false;
 const schema=tools[0].inputSchema;
 if(schema?.type!=='object'||!isObj(schema.properties))return false;
 for(const key of ['area_id','limit','offset'])
  if(!isObj(schema.properties[key]))return false;
 const area=schema.properties.area_id;
 const supportsString=area.type==='string'||Array.isArray(area.anyOf)&&area.anyOf.some(x=>x?.type==='string');
 if(!supportsString||schema.properties.limit.type!=='integer'||schema.properties.offset.type!=='integer')return false;
 const required=schema.required??[];
 return Array.isArray(required)&&required.every(x=>['area_id','limit','offset'].includes(x));
}

export function inspectDevicePage(raw,{areaId,offset,limit}={}){
 if(raw?.isError===true||!isObj(raw?.structuredContent))return {valid:false,reason:'invalid_envelope'};
 const d=raw.structuredContent;
 if(d.success!==true||!Array.isArray(d.devices)||!integer(d.count)||!integer(d.total_count)||
    !integer(d.offset)||!integer(d.limit)||typeof d.has_more!=='boolean'||
    !integer(offset)||!integer(limit)||!Number.isSafeInteger(limit)||limit>50||
    d.offset!==offset||d.count!==d.devices.length||d.devices.length>limit||
    d.total_count<offset+d.devices.length||d.limit!==limit)
  return {valid:false,reason:'invalid_page'};
 if(d.area_filter!==areaId)return {valid:false,reason:'area_mismatch'};
 if(d.has_more&&(!integer(d.next_offset)||d.next_offset<=offset||
    d.next_offset!==offset+d.devices.length||!d.devices.length))
  return {valid:false,reason:'pagination_invalid'};
 if(!d.has_more&&d.next_offset!==null&&d.next_offset!==undefined)
  return {valid:false,reason:'terminal_page_invalid'};
 if(!d.has_more&&offset+d.devices.length!==d.total_count)
  return {valid:false,reason:'total_mismatch'};
 const ids=[];
 for(const device of d.devices){
  if(!isObj(device)||typeof device.device_id!=='string'||
    !/^[a-z0-9]{8,64}$/.test(device.device_id)||device.area_id!==areaId)
   return {valid:false,reason:'device_identity_or_area_mismatch'};
  ids.push(device.device_id);
 }
 if(new Set(ids).size!==ids.length)return {valid:false,reason:'duplicate_ids'};
 return {valid:true,count:ids.length,ids,nextOffset:d.has_more?d.next_offset:null,
  total:d.total_count,hasMore:d.has_more};
}

export async function countAreaDevices({areaResponse,manifest,readPage}={}){
 const catalog=buildNativeHAAreaCatalog(areaResponse);
 if(catalog.status!=='complete_area_metadata'||catalog.areas.length>AREA_CENSUS_LIMITS.maxAreas)
  return {status:'unverified',reason:'area_metadata_invalid',calls:0};
 if(!inspectDeviceListAdmission(manifest)||typeof readPage!=='function')
  return {status:'unverified',reason:'schema_invalid',calls:0};
 let calls=0;
 const byArea=[];
 for(const area of catalog.areas){
  let offset=0,total=null;
  const seen=new Set();
  let complete=false;
  for(let page=0;page<AREA_CENSUS_LIMITS.maxPagesPerArea;page++){
   if(calls>=AREA_CENSUS_LIMITS.maxTotalCalls)
    return {status:'partial',reason:'call_limit',calls,areasChecked:byArea.length};
   calls++;
   let raw;
   try{raw=await readPage({area_id:area.area_id,offset,limit:AREA_CENSUS_LIMITS.pageSize});}
   catch{return {status:'partial',reason:'read_failed',calls,areasChecked:byArea.length};}
   const inspected=inspectDevicePage(raw,{areaId:area.area_id,offset,limit:AREA_CENSUS_LIMITS.pageSize});
   if(!inspected.valid)return {status:'partial',reason:inspected.reason,calls,areasChecked:byArea.length};
   if(total!==null&&total!==inspected.total)
    return {status:'partial',reason:'changing_total',calls,areasChecked:byArea.length};
   total=inspected.total;
   if(inspected.ids.some(id=>seen.has(id)))
    return {status:'partial',reason:'duplicate_across_pages',calls,areasChecked:byArea.length};
   inspected.ids.forEach(id=>seen.add(id));
   if(!inspected.hasMore){complete=true;break;}
   offset=inspected.nextOffset;
  }
  if(!complete)return {status:'partial',reason:'page_limit',calls,areasChecked:byArea.length};
  if(seen.size!==total)return {status:'partial',reason:'area_total_mismatch',calls,areasChecked:byArea.length};
  byArea.push({areaOrdinal:byArea.length+1,devices:seen.size,pages:Math.ceil(seen.size/AREA_CENSUS_LIMITS.pageSize)||1});
 }
 return {status:'area_device_census_complete',calls,areasChecked:byArea.length,
  areaDeviceRecords:byArea.reduce((n,x)=>n+x.devices,0),
  byArea,deviceRegistryComplete:false,entityRegistryComplete:false,labelRegistryComplete:false,
  authorizesRead:false,authorizesWrite:false};
}
