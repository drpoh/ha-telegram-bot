// Native HA-MCP floors/areas response -> read-only catalog.
// Never confuses an AREA label with an ENTITY label and never grants HA access.
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'?x.trim():'';
const areaId=x=>/^[a-z0-9_]{1,100}$/.test(x)?x:null;
const unique=xs=>[...new Set(xs)];
const safeLabels=v=>Array.isArray(v)?unique(v.filter(x=>typeof x==='string'&&/^[a-z0-9_]{1,100}$/.test(x))):[];
const alias=v=>Array.isArray(v)?unique(v.map(text).filter(x=>x.length>0&&x.length<=100)).slice(0,30):[];
const count=x=>Number.isSafeInteger(x)&&x>=0?x:null;
const failure=(reason,counts={})=>({status:'unverified',reason,counts,
 areas:[],floorIds:[],complete:false,authorizesRead:false,authorizesWrite:false});
export function buildNativeHAAreaCatalog(raw){
 const envelope=object(raw)&&object(raw.structuredContent)?raw.structuredContent:raw;
 if(raw?.isError===true||!object(envelope)||envelope.success!==true||
    !Array.isArray(envelope.floors)||!Array.isArray(envelope.unassigned_areas)||
    !Array.isArray(envelope.orphaned_areas))
  return failure('invalid_envelope');
 const reported=count(envelope.area_count),floors=count(envelope.floor_count);
 const all=[];
 const floorIds=[];
 const seenFloors=new Set();
 for(const floor of envelope.floors){
  const fid=areaId(floor?.floor_id);
  if(!fid||seenFloors.has(fid)||!Array.isArray(floor.areas))
   return failure('invalid_floor');
  seenFloors.add(fid);floorIds.push(fid);
  for(const area of floor.areas)all.push({area,floorId:fid,source:'floor'});
 }
 for(const area of envelope.unassigned_areas)all.push({area,floorId:null,source:'unassigned'});
 if(envelope.orphaned_areas.length)return failure('orphaned_areas');
 const seen=new Set(),areas=[];
 for(const {area,floorId,source} of all){
  const aid=areaId(area?.area_id),name=text(area?.name);
  if(!aid||seen.has(aid)||!name||name.length>100)return failure('invalid_or_duplicate_area');
  // Fail closed on contradictory area/floor association.
  if(source==='floor' && area.floor_id!=null && area.floor_id!==floorId)
   return failure('floor_mismatch');
  if(source==='unassigned' && area.floor_id!=null)return failure('unassigned_floor_mismatch');
  seen.add(aid);
  areas.push(Object.freeze({
   area_id:aid,name,aliases:Object.freeze(alias(area.aliases)),floor_id:floorId,
   area_labels:Object.freeze(safeLabels(area.labels)),
   temperature_entity_id:typeof area.temperature_entity_id==='string'?area.temperature_entity_id:null,
   humidity_entity_id:typeof area.humidity_entity_id==='string'?area.humidity_entity_id:null
  }));
 }
 const counts={reportedAreas:reported,observedAreas:areas.length,
  reportedFloors:floors,observedFloors:floorIds.length,
  unassignedAreas:envelope.unassigned_areas.length,orphanedAreas:0};
 if(reported!==areas.length||floors!==floorIds.length||
    envelope.unassigned_count!=null&&count(envelope.unassigned_count)!==envelope.unassigned_areas.length)
  return failure('count_mismatch',counts);
 return Object.freeze({
  status:'complete_area_metadata',reason:'verified_counts',counts,
  areas:Object.freeze(areas),floorIds:Object.freeze(floorIds),
  // This is area metadata completeness, NOT full devices/entities/labels coverage.
  complete:true,entityRegistryComplete:false,deviceRegistryComplete:false,
  labelRegistryComplete:false,authorizesRead:false,authorizesWrite:false
 });
}
export function summarizeAreaCatalogCoverage(catalog){
 if(catalog?.status!=='complete_area_metadata')return {status:'unavailable'};
 const c=catalog.counts;
 return {status:'areas_only',floors:c.observedFloors,areas:c.observedAreas,
  unassigned:c.unassignedAreas,areaLabelReferences:catalog.areas.reduce((n,a)=>n+a.area_labels.length,0),
  entityRegistryComplete:false,deviceRegistryComplete:false,labelRegistryComplete:false,
  authorizesRead:false,authorizesWrite:false};
}
