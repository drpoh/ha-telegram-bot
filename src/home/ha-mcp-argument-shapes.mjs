// Audit supported top-level HA-MCP input shapes without leaking schema prose,
// examples, defaults or secret/unknown argument names. Never execute these tools.
const targets=new Set(['ha_get_entity','ha_get_device','ha_search','ha_config_get_label']);
const fields=new Set([
 'area_id','device_id','entity_id','label_id','domain','query','limit','offset',
 'include_hidden','search_type','type','search_types'
]);
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const typeOf=x=>{
 if(!object(x))return 'invalid';
 if(typeof x.type==='string')return x.type;
 if(Array.isArray(x.type))return x.type.filter(t=>typeof t==='string').sort().join('|')||'unknown';
 if(Array.isArray(x.anyOf))return 'anyOf:'+x.anyOf.map(typeOf).slice(0,6).join('|');
 if(Array.isArray(x.oneOf))return 'oneOf:'+x.oneOf.map(typeOf).slice(0,6).join('|');
 return 'unknown';
};
export function auditKnownMCPArgumentShapes(manifest){
 if(!Array.isArray(manifest))throw Error('invalid_mcp_manifest');
 const out=[];
 for(const name of [...targets]){
  const matches=manifest.filter(x=>x?.name===name);
  if(matches.length!==1){out.push({name,status:'missing_or_duplicate'});continue;}
  const schema=matches[0].inputSchema;
  if(!object(schema)||!object(schema.properties)){
   out.push({name,status:'invalid_schema'});continue;
  }
  const supported=Object.entries(schema.properties).filter(([k])=>fields.has(k))
   .map(([key,value])=>({key,type:typeOf(value),
    enumCount:Array.isArray(value?.enum)?value.enum.length:0,
    hasItems:object(value?.items)})).sort((a,b)=>a.key.localeCompare(b.key));
  const required=Array.isArray(schema.required)?schema.required:[];
  out.push({name,status:'shape_only',supported,
   otherFieldCount:Object.keys(schema.properties).length-supported.length,
   requiredKnown:required.filter(k=>fields.has(k)).sort(),
   unknownRequiredCount:required.filter(k=>!fields.has(k)).length});
 }
 return {status:'shape_only',tools:out,toolsCalled:0,haWrites:0};
}
