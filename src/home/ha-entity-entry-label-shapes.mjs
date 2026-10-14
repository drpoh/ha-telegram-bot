// Pure shape audit of a known HA entity registry entry and label listing.
// Deliberately excludes values, names, IDs, descriptions and runtime states.
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safeKey=k=>/^[a-z][a-z0-9_]{0,60}$/.test(k);
const kind=v=>Array.isArray(v)?'array':v===null?'null':typeof v;
const describe=v=>({
 type:kind(v),
 ...(Array.isArray(v)?{count:v.length,elementType:v.length?kind(v[0]):'empty'}:{})
});
export function inspectEntityEntryShape(raw){
 const data=raw?.structuredContent;
 if(raw?.isError===true||!obj(data)||data.success!==true||!obj(data.entity_entry))
  return {status:'unavailable',fields:[],completeRegistry:false,authorization:false};
 const fields=Object.entries(data.entity_entry).filter(([k])=>safeKey(k))
  .slice(0,45).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>({
   key,...describe(value)
  }));
 return {status:'entity_shape_only',fields,completeRegistry:false,authorization:false};
}
export function inspectLabelListShape(raw){
 const data=raw?.structuredContent;
 if(raw?.isError===true||!obj(data)||data.success!==true||
    !Array.isArray(data.labels)||!Number.isSafeInteger(data.count)||
    data.count!==data.labels.length)
  return {status:'unavailable',count:0,fields:[],completeRegistry:false};
 const allKeys=new Set();
 for(const label of data.labels){
  if(!obj(label))return {status:'unavailable',count:0,fields:[],completeRegistry:false};
  for(const k of Object.keys(label))if(safeKey(k))allKeys.add(k);
 }
 return {status:'label_list_shape_only',count:data.count,
  fields:[...allKeys].sort(),completeRegistry:false,authorization:false};
}
// Only explicit Home Assistant label name mappings; unknown labels do not
// inherit lighting/control permissions from room names or entity domains.
const classes=new Map([
 ['освещение','lighting'],['свет','lighting'],['lighting','lighting'],
 ['управление','control'],['control','control'],
 ['системный','system'],['системные','system'],['system','system']
]);
export function classifyReviewedLabels(records){
 if(!Array.isArray(records)||records.length>100)return {status:'invalid'};
 const ids=new Set(),totals={lighting:0,control:0,system:0,other:0};
 for(const record of records){
  if(!obj(record)||typeof record.label_id!=='string'||
     !/^[a-z0-9_]{1,100}$/.test(record.label_id)||
     typeof record.name!=='string'||ids.has(record.label_id))
   return {status:'invalid'};
  ids.add(record.label_id);
  const norm=record.name.trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е');
  totals[classes.get(norm)??'other']++;
 }
 return {status:'counts_only',count:records.length,totals,
  authorizesRead:false,authorizesWrite:false};
}
