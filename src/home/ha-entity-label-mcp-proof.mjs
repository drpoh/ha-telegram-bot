// Read-only candidate proof from existing HA-MCP tools. This is not a
// complete HA registry export or service-call authorization.
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const type=x=>Array.isArray(x)?'array':x===null?'null':typeof x;
const safe=/^[a-z][a-z0-9_]{0,60}$/;
const acceptsString=p=>p?.type==='string'||Array.isArray(p?.anyOf)&&p.anyOf.some(x=>x?.type==='string');
export function authorizeEntityLabelProof(tools){
 if(!Array.isArray(tools))return {allowed:false,reason:'missing_manifest'};
 const entity=tools.filter(t=>t?.name==='ha_get_entity');
 const label=tools.filter(t=>t?.name==='ha_config_get_label');
 if(entity.length!==1||label.length!==1)return {allowed:false,reason:'missing_or_duplicate_tool'};
 const e=entity[0].inputSchema,l=label[0].inputSchema;
 if(e?.type!=='object'||l?.type!=='object'||!acceptsString(e.properties?.entity_id)||
    !acceptsString(l.properties?.label_id)||!Array.isArray(l.properties?.label_id?.anyOf)||!l.properties.label_id.anyOf.some(x=>x?.type==='null')||!Array.isArray(e.required??[])||
    !Array.isArray(l.required??[])||
    (e.required??[]).some(k=>k!=='entity_id')||
    (l.required??[]).some(k=>k!=='label_id'))
  return {allowed:false,reason:'invalid_schema'};
 return {allowed:true,entityName:'ha_get_entity',
  entityArgs:{entity_id:'light.tambur_svet_l1'},
  // Null is supported explicitly by the owner's audited schema.
  labelName:'ha_config_get_label',labelArgs:{label_id:null},
  authorization:false,actualWrite:false};
}
export function summarizeEntityLabelShape(raw){
 if(!obj(raw)||raw.isError===true||!obj(raw.structuredContent))
  return {status:'unavailable'};
 const data=raw.structuredContent;
 const fields=Object.entries(data).filter(([k])=>safe.test(k)).slice(0,24)
  .map(([key,value])=>({
   key,type:type(value),...(Array.isArray(value)?{count:value.length}:{}),
   ...(Array.isArray(value)&&obj(value[0])?{
    firstRecordKeys:Object.keys(value[0]).filter(k=>safe.test(k)).sort().slice(0,25)
   }:{})
  }));
 return {status:'shape_only',fields,authorization:false,actualWrite:false};
}
