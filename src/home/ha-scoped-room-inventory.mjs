// Join native area metadata to verified per-entity/per-device read-only
// metadata. Partial MCP responses are NEVER treated as a complete registry.
import {buildNativeHAAreaCatalog} from './ha-native-area-catalog.mjs';
import {buildHAReadOnlyMetadataIndex,proposeReadOnlyEntityIds} from './ha-registry-metadata-index.mjs';
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safeId=x=>typeof x==='string'&&/^[a-z0-9_]+\.[a-z0-9_]+$/.test(x);
const failure=reason=>Object.freeze({
 status:'unverified',reason,areas:0,entities:[],coverage:null,
 registryComplete:false,authorizesRead:false,authorizesWrite:false
});
export function buildScopedHARoomInventory({
 areaResponse,entityRecords,deviceRecords=[],labelRecords=[],
 approvedReadIds=[]
}={}){
 const catalog=buildNativeHAAreaCatalog(areaResponse);
 if(catalog.status!=='complete_area_metadata')return failure('area_catalog_incomplete');
 if(!Array.isArray(entityRecords)||!Array.isArray(deviceRecords)||
    !Array.isArray(labelRecords)||!Array.isArray(approvedReadIds) ||
    entityRecords.length>500||deviceRecords.length>500||labelRecords.length>100)
  return failure('invalid_metadata');
 const ids=new Set();
 for(const item of entityRecords){
  const id=item?.entity_id??item?.ei;
  if(!safeId(id)||ids.has(id))return failure('duplicate_or_invalid_entity');
  ids.add(id);
 }
 // Require object records to be verified manually against the actual MCP tool
 // response shape before passing them here. No discovery is done by this adapter.
 const index=buildHAReadOnlyMetadataIndex({
  areas:catalog.areas,devices:deviceRecords,labels:labelRecords,entities:entityRecords
 });
 const approved=new Set(approvedReadIds.filter(safeId));
 const entries=index.map(e=>Object.freeze({
  entityId:e.entityId,areaId:e.areaId,areaName:e.areaName,
  category:e.category,domain:e.domain,
  readApproved:approved.has(e.entityId),
  requiresReview:!approved.has(e.entityId),
  // Category "lighting" is metadata only, never an authorization decision.
  actionApproved:false
 }));
 const coverage={
  areaTotal:catalog.counts.observedAreas,
  observedEntities:index.length,
  unassignedEntities:index.filter(e=>e.areaId===null).length,
  classifiedEntities:index.filter(e=>['lighting','control','system'].includes(e.category)).length,
  ambiguousEntities:index.filter(e=>e.category==='ambiguous').length,
  unclassifiedEntities:index.filter(e=>e.category==='unclassified').length,
  unknownReadScope:entries.filter(e=>!e.readApproved).length
 };
 return Object.freeze({
  status:'partial_entity_metadata',reason:'scoped_metadata_only',
  areas:catalog.areas.length,entities:Object.freeze(entries),coverage,
  registryComplete:false,
  authorizesRead:false,authorizesWrite:false
 });
}

export function summarizeScopedRoomLighting(inventory,{area}={}){
 if(inventory?.status!=='partial_entity_metadata'||typeof area!=='string')
  return {status:'unavailable',entities:[],authorization:false,actualWrite:false};
 const normal=value=>typeof value==='string'?value.trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е'):'';
 const q=normal(area);
 if(!q)return {status:'unavailable',entities:[],authorization:false,actualWrite:false};
 const candidates=inventory.entities.filter(e=>normal(e.areaName)===q&&
  e.category==='lighting'&&e.domain==='light');
 return {
  status:'candidate_only',
  // Without a complete registry this is not the full physical room inventory.
  entities:candidates.map(e=>({id:e.entityId,readApproved:e.readApproved,
   requiresReview:e.requiresReview,actionApproved:false})),
  partial:true,authorization:false,actualWrite:false
 };
}
