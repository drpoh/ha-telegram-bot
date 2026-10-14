// Read-only interpretation of Home Assistant registry metadata.
// It is NOT an HA authorization grant, a device-to-physical-fixture guarantee,
// or a replacement for exact-ID MCP allowlists.
const slug=x=>typeof x==='string'?x.trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е'):'';
const id=x=>typeof x==='string'&&/^[a-z0-9_]+$/.test(x)?x:null;
const entityId=x=>typeof x==='string'&&/^[a-z0-9_]+\.[a-z0-9_]+$/.test(x)?x:null;
const unique=xs=>[...new Set(xs)];
const recognized=new Map([
 ['освещение','lighting'],['свет','lighting'],['lighting','lighting'],
 ['управление','control'],['control','control'],
 ['системный','system'],['системные','system'],['system','system']
]);
const getLabelId=x=>id(x?.label_id??x?.id);
const getAreaId=x=>id(x?.area_id??x?.id);
const getDeviceId=x=>id(x?.id);
const cleanNames=x=>Array.isArray(x)?x.filter(v=>typeof v==='string'&&v.trim()):[];

export function buildHAReadOnlyMetadataIndex({areas,devices,labels,entities}={}){
 if(!Array.isArray(areas)||!Array.isArray(devices)||!Array.isArray(labels)||
    !Array.isArray(entities))throw Error('invalid_registry_snapshot');
 const areaMap=new Map(areas.filter(a=>getAreaId(a)).map(a=>[getAreaId(a),{
  id:getAreaId(a),name:typeof a.name==='string'?a.name:'',aliases:cleanNames(a.aliases)
 }]));
 const deviceMap=new Map(devices.filter(d=>getDeviceId(d)).map(d=>[getDeviceId(d),d]));
 const labelMap=new Map(labels.filter(l=>getLabelId(l)).map(l=>[getLabelId(l),l]));
 const indexed=[];
 for(const e of entities){
  const eid=entityId(e?.entity_id??e?.ei);
  if(!eid||eid.startsWith('light.browser_mod')||e?.disabled_by!=null||e?.hidden_by!=null||e?.hb===true)continue;
  const did=id(e?.device_id??e?.di),dev=deviceMap.get(did);
  // Entity area overrides device area. No area? Leave unassigned, never guess.
  const areaId=id(e?.area_id??e?.ai)??id(dev?.area_id);
  const area=areaMap.get(areaId);
  const labelIds=unique([
   ...(Array.isArray(e?.labels)?e.labels:Array.isArray(e?.lb)?e.lb:[]),
   ...(Array.isArray(dev?.labels)?dev.labels:[])
  ].map(id).filter(Boolean));
  const labelNames=labelIds.map(k=>labelMap.get(k)?.name).filter(x=>typeof x==='string');
  const kinds=unique(labelNames.map(x=>recognized.get(slug(x))).filter(Boolean));
  const category=kinds.length===1?kinds[0]:kinds.length>1?'ambiguous':'unclassified';
  indexed.push(Object.freeze({
   entityId:eid,areaId:area?.id??null,areaName:area?.name??null,
   areaAliases:area?.aliases??[],labelIds:Object.freeze(labelIds),
   labelNames:Object.freeze(labelNames),category,
   domain:eid.split('.')[0],
   // Default usability: do not surface system or unlabeled entries in normal room lists.
   visibleInRoom:!!area&&category==='lighting'&&eid.startsWith('light.')
  }));
 }
 return Object.freeze(indexed);
}

export function selectHAAreaEntities(index,{area,category='lighting'}={}){
 if(!Array.isArray(index)||typeof area!=='string')return [];
 const q=slug(area);
 if(!q)return [];
 return index.filter(e=>e&&e.category===category&&
  (slug(e.areaName)===q||e.areaAliases.some(name=>slug(name)===q)));
}

// ONLY for reporting and proposed inventory updates. Never pass directly
// to HA call_service, and do not treat a label as command authorization.
export function proposeReadOnlyEntityIds(index,{area,category='lighting',approvedReadIds=[]}={}){
 const approved=new Set(Array.isArray(approvedReadIds)?approvedReadIds:[]);
 return selectHAAreaEntities(index,{area,category}).map(x=>Object.freeze({
  id:x.entityId,
  area:x.areaName,
  category:x.category,
  readApproved:approved.has(x.entityId),
  requiresReview:!approved.has(x.entityId)
 }));
}
