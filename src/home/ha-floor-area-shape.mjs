// Shape-only structural audit of HA-MCP floor/area metadata.
// Never prints floor/room names, IDs, aliases, raw values or credentials.
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const keySafe=x=>/^[a-z][a-z0-9_]{0,48}$/.test(x);
const kind=x=>Array.isArray(x)?'array':object(x)?'object':x===null?'null':typeof x;
export function describeFloorAreaStructure(data){
 if(!object(data)||data.success!==true||!Array.isArray(data.floors)||
    !Array.isArray(data.unassigned_areas)||!Array.isArray(data.orphaned_areas))
  return {status:'unavailable',reason:'unexpected_shape'};
 const entries=[
  ...data.floors.slice(0,4).map(x=>({path:'floors[]',item:x})),
  ...data.unassigned_areas.slice(0,2).map(x=>({path:'unassigned_areas[]',item:x}))
 ];
 const rows=[];
 for(const {path,item} of entries){
  if(!object(item)){rows.push({path,kind:kind(item)});continue;}
  const fields=Object.keys(item).filter(keySafe).sort().slice(0,25).map(key=>{
   const val=item[key];
   return {key,type:kind(val),...(Array.isArray(val)?{count:val.length}:{}),
    ...(Array.isArray(val)&&val.length&&object(val[0])?{
     itemKeys:Object.keys(val[0]).filter(keySafe).sort().slice(0,25)
    }:{})};
  });
  rows.push({path,fields});
 }
 return {
  status:'structure_only',
  counts:{
   reportedFloors:Number.isSafeInteger(data.floor_count)&&data.floor_count>=0?data.floor_count:null,
   reportedAreas:Number.isSafeInteger(data.area_count)&&data.area_count>=0?data.area_count:null,
   unassigned:data.unassigned_areas.length,
   orphaned:data.orphaned_areas.length,
   floorRecords:data.floors.length
  },
  samples:rows,
  noStateReads:true,
  noWrites:true
 };
}
