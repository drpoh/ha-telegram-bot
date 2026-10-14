// Pure schema-only HA-MCP inspection. Classify tool descriptors, do not call them.
// Tool names and property names may be supplied by external MCP; emit only a fixed
// known list, allowed primitive schema types, and safe counts.
export const TARGET_TOOL_NAMES=Object.freeze([
 'ha_list_floors_areas','ha_get_entity','ha_get_device','ha_search',
 'ha_config_get_label','ha_config_get_category','ha_get_overview',
 'ha_get_zone','ha_get_skill_guide'
]);
const safeTypes=new Set(['string','number','integer','boolean','array','object','null']);
const knownArgs=new Set([
 'area','area_id','floor','floor_id','entity_id','device_id','label_id',
 'id','name','query','search_type','type','domain','limit','offset',
 'include_disabled','include_hidden','category_id','label','category'
]);
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function describeSchema(schema){
 if(!isObject(schema))return {schema:'missing_or_invalid',required:[],fields:[],extraFieldCount:0};
 const properties=isObject(schema.properties)?schema.properties:{};
 const safeFields=Object.keys(properties).filter(x=>knownArgs.has(x)).sort();
 const required=Array.isArray(schema.required)?schema.required.filter(x=>knownArgs.has(x)).sort():[];
 const fields=safeFields.map(name=>{
  const spec=properties[name];
  const t=typeof spec?.type==='string'?spec.type:'unknown';
  return {name,type:safeTypes.has(t)?t:'other'};
 });
 return {schema:'present',required,fields,extraFieldCount:Object.keys(properties).length-fields.length};
}
export function inspectHARegistrySchemas(manifest){
 if(!Array.isArray(manifest))throw Error('invalid_mcp_manifest');
 const byName=new Map();
 for(const tool of manifest){
  if(isObject(tool)&&TARGET_TOOL_NAMES.includes(tool.name)&&!byName.has(tool.name))
   byName.set(tool.name,tool);
 }
 const tools=TARGET_TOOL_NAMES.map(name=>Object.freeze({
  name,available:byName.has(name),
  ...(byName.has(name)?describeSchema(byName.get(name).inputSchema):{
   schema:'not_exposed',required:[],fields:[],extraFieldCount:0
  })
 }));
 return Object.freeze({
  status:'schema_only',
  toolCount:manifest.length,
  reviewed:tools.filter(x=>x.available).length,
  tools,
  toolsCalled:0,
  fullRegistryAvailable:false,
  authorizeRead:false,
  authorizeWrite:false
 });
}
