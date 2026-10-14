// Pure structural inspection of HA-MCP area read results. No values/identifiers
// or entity states are copied into the report.
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safeKey=x=>/^[a-z][a-z0-9_]{0,60}$/i.test(x);
const brief=v=>Array.isArray(v)?'array':v===null?'null':typeof v;
function describe(value,depth=0){
 if(depth>3)return {type:brief(value)};
 if(Array.isArray(value)){
  const item=value.find(x=>x!==null);
  return {type:'array',count:value.length,
   sample:item===undefined?null:describe(item,depth+1)};
 }
 if(obj(value)){
  const fields=Object.keys(value).filter(safeKey).slice(0,30).sort();
  return {type:'object',fields:Object.fromEntries(
   fields.map(key=>[key,depth===2?{type:brief(value[key])}:describe(value[key],depth+1)])
  )};
 }
 return {type:brief(value)};
}
export function summarizeHAAreaStructure(raw){
 if(!obj(raw)||raw.isError===true||!obj(raw.structuredContent))
  return {status:'unavailable'};
 const data=raw.structuredContent;
 if(data.success!==true||!Array.isArray(data.floors)||
    !Array.isArray(data.unassigned_areas)||!Array.isArray(data.orphaned_areas))
  return {status:'unavailable'};
 return {
  status:'shape_only',
  floorCount:Number.isSafeInteger(data.floor_count)?data.floor_count:null,
  areaCount:Number.isSafeInteger(data.area_count)?data.area_count:null,
  unassignedCount:Number.isSafeInteger(data.unassigned_count)?data.unassigned_count:null,
  orphanedCount:Number.isSafeInteger(data.orphaned_count)?data.orphaned_count:null,
  floors:describe(data.floors),
  unassigned:describe(data.unassigned_areas),
  orphaned:describe(data.orphaned_areas),
  permitsWrites:false,
  fullRegistryVerified:false
 };
}
