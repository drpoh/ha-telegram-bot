// Pure HA-MCP capability inspection. A tool name is NOT proof its schema is safe
// or permission to call it. Never invoke discovered tools automatically.
const registryHints=Object.freeze({
 areas:['area_registry','list_areas','get_areas','area_list'],
 devices:['device_registry','list_devices','get_devices','device_list'],
 entities:['entity_registry','list_entities','get_entities','entity_list'],
 labels:['label_registry','list_labels','get_labels','label_list']
});
const callDenied=/set|create|delete|remove|update|edit|write|call_service|execute|trigger|reload|restart|toggle|turn_on|turn_off|install/i;
const canonicalReadOnly=/^ha_(?:config_)?(?:get|list|search|overview|read)_/;
const normalize=x=>typeof x==='string'?x.toLowerCase().trim():'';
export function inspectHARegistryCapabilities(tools){
 if(!Array.isArray(tools))throw Error('invalid_mcp_tool_manifest');
 const catalog=tools.filter(x=>typeof x?.name==='string'&&/^[a-z_][a-z0-9_]*$/i.test(x.name))
  .map(x=>x.name);
 const seen=[...new Set(catalog)];
 const eligible=seen.filter(x=>canonicalReadOnly.test(x)&&!callDenied.test(x));
 const groups={};
 for(const [key,hints] of Object.entries(registryHints)){
  groups[key]=eligible.filter(name=>hints.some(h=>normalize(name).includes(h)));
 }
 const discover=eligible.filter(name=>/^(?:ha_)?(?:get|list|search|overview)/.test(name)||
  /ha_(?:get_overview|search|config_get_category|config_get_label)/.test(name));
 const sufficient=Object.values(groups).every(arr=>arr.length>0);
 return Object.freeze({
  status:sufficient?'candidates_for_schema_review':'incomplete_registry_coverage',
  toolCount:seen.length,
  safeNameCandidates:Object.freeze(eligible),
  registryCandidates:Object.freeze(groups),
  discoveryCandidates:Object.freeze(discover),
  canBuildLiveIndex:false, // Listing a tool is not proof of required schema or authorization.
  toolCallsMade:0
 });
}
