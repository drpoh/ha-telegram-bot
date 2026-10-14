import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectHARegistryCapabilities} from '../src/home/ha-registry-mcp-capabilities.mjs';

test('manifest-only inspection exposes relevant registry list candidates without calling them',()=>{
 const tools=[
  'ha_config_list_areas','ha_config_list_devices','ha_config_list_entities','ha_config_list_labels',
  'ha_get_overview','ha_search','ha_call_service','ha_config_set_label',
  'ha_config_remove_device','ha_config_update_entity','ha_config_get_category'
 ].map(name=>({name}));
 const r=inspectHARegistryCapabilities(tools);
 assert.equal(r.status,'candidates_for_schema_review');
 assert.deepEqual(Object.fromEntries(Object.entries(r.registryCandidates).map(([k,v])=>[k,v.length])),{
  areas:1,devices:1,entities:1,labels:1
 });
 assert.equal(r.canBuildLiveIndex,false);
 assert.equal(r.toolCallsMade,0);
 assert.ok(r.discoveryCandidates.includes('ha_get_overview'));
 assert.ok(r.discoveryCandidates.includes('ha_search'));
 assert.ok(!r.safeNameCandidates.includes('ha_call_service'));
 assert.ok(!r.safeNameCandidates.includes('ha_config_set_label'));
});
test('realistic HA-MCP tools need separate registry access; search is not equivalent to metadata registry',()=>{
 const names=['ha_get_overview','ha_search','ha_config_get_label','ha_config_get_category','ha_config_list_groups'];
 const r=inspectHARegistryCapabilities(names.map(name=>({name})));
 assert.equal(r.status,'incomplete_registry_coverage');
 assert.equal(r.registryCandidates.entities.length,0);
 assert.equal(r.canBuildLiveIndex,false);
 assert.equal(r.toolCallsMade,0);
});
test('malformed manifest and malicious tool names cannot acquire additional access',()=>{
 assert.throws(()=>inspectHARegistryCapabilities({tools:[]}),/invalid_mcp_tool_manifest/);
 const r=inspectHARegistryCapabilities([
  {name:'ha_config_list_entities'},{name:'ha_config_list_entities'},
  {name:'ha_config_list_entities;ha_call_service'},{name:'ha_call_service'},
  {name:'ha_config_set_areas'},{name:'ha_config_get_labels'},{name:5}
 ]);
 assert.deepEqual(r.registryCandidates.entities,['ha_config_list_entities']);
 assert.equal(r.registryCandidates.areas.length,0);
 assert.equal(r.toolCount,4);
});
test('operator script uses only listTools and never invokes arbitrary MCP tools or writes',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-ha-registry-capability-audit.mjs',import.meta.url),'utf8');
 assert.match(src,/client\.listTools\(\)/);
 assert.doesNotMatch(src,/client\.callTool\(|ha_call_service|bot\.launch\(|systemctl|\.dispatch\(/);
 assert.match(src,/REGISTRY_SNAPSHOT_TAKEN=NO/);
 assert.match(src,/HA_WRITES=NO/);
});
