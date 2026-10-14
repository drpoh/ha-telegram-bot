// Pure offline normalizer for five native Home Assistant WebSocket registries.
// No network, disk, credentials, service calls or automatic read/write rights.
export const HA_REGISTRY_READ_COMMANDS=Object.freeze([
 'config/floor_registry/list','config/area_registry/list',
 'config/device_registry/list','config/entity_registry/list',
 'config/label_registry/list'
]);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validId=x=>typeof x==='string'&&/^[a-z0-9_]{1,128}$/.test(x);
const entityId=x=>typeof x==='string'&&/^[a-z0-9_]+\.[a-z0-9_]+$/.test(x);
const has=x=>x!==null&&x!==undefined;
const distinct=x=>[...new Set(x)];
const validLabels=x=>Array.isArray(x)&&x.every(validId);
const rejected=(reason,section)=>Object.freeze({
 status:'unverified',reason,section,complete:false,
 authorizesRead:false,authorizesWrite:false
});
const requirements=[
 ['floors','floor_id'],['areas','area_id'],['devices','id'],
 ['entities','entity_id'],['labels','label_id']
];
export function normalizeHAWebSocketSnapshot(registries){
 if(!obj(registries))return rejected('missing_snapshot');
 const maps={};
 for(const [section,key] of requirements){
  const values=registries[section];
  if(!Array.isArray(values)||values.length>10000)return rejected('missing_or_unbounded_section',section);
  const index=new Map();
  for(const entry of values){
   if(!obj(entry)||!validId(entry[key])&&!(section==='entities'&&entityId(entry[key]))||
      index.has(entry[key]))return rejected('invalid_or_duplicate_identity',section);
   if(has(entry.labels)&&!validLabels(entry.labels))return rejected('invalid_labels',section);
   index.set(entry[key],entry);
  }
  maps[section]=index;
 }
 const output=[],unassigned=[];
 for(const e of registries.entities){
  const dId=has(e.device_id)?e.device_id:null;
  if(dId!==null&&!validId(dId))return rejected('invalid_device_link','entities');
  const device=dId!==null?maps.devices.get(dId):undefined;
  // Unknown device references must not silently turn into "unassigned".
  if(dId!==null&&!device)return rejected('unknown_device_link','entities');
  const directArea=has(e.area_id)?e.area_id:null;
  if(directArea!==null&&!validId(directArea))return rejected('invalid_area_link','entities');
  const resolvedArea=directArea??device?.area_id??null;
  if(resolvedArea!==null&&!validId(resolvedArea))return rejected('invalid_area_link','devices');
  const area=resolvedArea===null?undefined:maps.areas.get(resolvedArea);
  if(resolvedArea!==null&&!area)return rejected('unknown_area_link','entities');
  const floorId=area?.floor_id??null;
  if(floorId!==null&&!maps.floors.has(floorId))return rejected('unknown_floor_link','areas');
  for(const [source,entry] of [['entity',e],['device',device],['area',area]]){
   if(!entry)continue;
   for(const label of entry.labels??[]){
    if(!maps.labels.has(label))return rejected('unknown_'+source+'_label',source);
   }
  }
  const labelsBySource=Object.freeze({
   entity:Object.freeze(distinct(e.labels??[])),
   device:Object.freeze(distinct(device?.labels??[])),
   area:Object.freeze(distinct(area?.labels??[]))
  });
  const disabled=has(e.disabled_by)||has(device?.disabled_by);
  const hidden=has(e.hidden_by);
  const item=Object.freeze({
   entityId:e.entity_id,domain:e.entity_id.split('.')[0],
   deviceId:dId,areaId:resolvedArea,floorId,
   labelsBySource,enabled:!disabled,hidden,
   // Meta discovery never permits state reads or control by itself.
   actionApproved:false,readApproved:false
  });
  output.push(item);
  if(resolvedArea===null)unassigned.push(e.entity_id);
 }
 return Object.freeze({
  status:'offline_snapshot_normalized',complete:true,
  counts:Object.freeze({
   floors:maps.floors.size,areas:maps.areas.size,
   devices:maps.devices.size,entities:maps.entities.size,labels:maps.labels.size,
   unassignedEntities:unassigned.length,
   unassignedDevices:registries.devices.filter(d=>d.area_id==null).length,
   disabledEntities:output.filter(e=>!e.enabled).length,
   hiddenEntities:output.filter(e=>e.hidden).length
  }),
  entities:Object.freeze(output),authorizesRead:false,authorizesWrite:false,
  // Proven complete only with individually successful native registry lists.
  source:'native_ws_all_five_lists_required'
 });
}
export function validateHAWebSocketResults(responses){
 if(!obj(responses))return rejected('no_responses');
 const sections=['floors','areas','devices','entities','labels'];
 const data={};
 for(const name of sections){
  const response=responses[name];
  if(!obj(response)||response.success!==true||!Array.isArray(response.result))
   return rejected('failed_registry_read',name);
  data[name]=response.result;
 }
 return normalizeHAWebSocketSnapshot(data);
}
