// Fail-closed inspection of a *single* HA-MCP entity-domain list attempt.
// The result is only structural evidence, not proof of registry completeness.
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safeKey=k=>/^[a-z][a-z0-9_]{0,50}$/.test(k);
const domainAllowed=new Set(['light','switch','sensor','binary_sensor']);
function nullableString(p){
 return obj(p)&&(p.type==='string'||Array.isArray(p.anyOf)&&p.anyOf.some(s=>s?.type==='string'));
}
export function admitEntityDomainMetadata({manifest,domain='light'}={}){
 if(!domainAllowed.has(domain)||!Array.isArray(manifest))return {allowed:false,reason:'invalid_scope'};
 const matches=manifest.filter(t=>t?.name==='ha_get_entity');
 if(matches.length!==1)return {allowed:false,reason:'tool_missing'};
 const schema=matches[0].inputSchema;
 if(schema?.type!=='object'||!obj(schema.properties)||
    !nullableString(schema.properties.domain)||
    !nullableString(schema.properties.entity_id))
  return {allowed:false,reason:'schema_unverified'};
 if(!Array.isArray(schema.required??[])||
   (schema.required??[]).some(x=>x!=='domain'))
  return {allowed:false,reason:'required_args_unverified'};
 // Intentionally omit entity_id, allowing the provider to indicate whether
 // domain-scoped enumeration is supported. No free-form search or entity states.
 return {allowed:true,tool:'ha_get_entity',args:{domain},
  registryComplete:false,authorizesRead:false,authorizesWrite:false};
}
const shape=value=>Array.isArray(value)?'array':value===null?'null':typeof value;
export function inspectEntityDomainReply(reply){
 if(!obj(reply)||reply.isError===true||!obj(reply.structuredContent))
  return {status:'unavailable',fields:[],registryComplete:false};
 const data=reply.structuredContent;
 const fields=Object.entries(data).filter(([k])=>safeKey(k)).slice(0,30)
  .map(([key,val])=>({
   key,type:shape(val),
   ...(Array.isArray(val)?{count:val.length,
    itemKeys:obj(val[0])?Object.keys(val[0]).filter(safeKey).sort().slice(0,25):[]}:{}),
   ...(obj(val)?{objectKeys:Object.keys(val).filter(safeKey).sort().slice(0,25)}:{})
  }));
 return {status:data.success===false?'provider_rejected':'shape_only',
  fields,registryComplete:false,authorizesRead:false,authorizesWrite:false};
}
