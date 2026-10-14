import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectHARegistrySchemas,TARGET_TOOL_NAMES} from '../src/home/ha-mcp-registry-schema-audit.mjs';
test('recognizes deployed area and entity capability names but not registry completeness',()=>{
 const manifest=[
  {name:'ha_list_floors_areas',inputSchema:{type:'object',properties:{floor_id:{type:'string'},include_hidden:{type:'boolean'},privateToken:{type:'string'}},required:['floor_id','privateToken']}},
  {name:'ha_get_entity',inputSchema:{type:'object',properties:{entity_id:{type:'string'}}}},
  {name:'ha_search',inputSchema:{type:'object',properties:{query:{type:'string'},limit:{type:'integer'}}}},
  {name:'ha_call_service',inputSchema:{type:'object',properties:{domain:{type:'string'},service:{type:'string'}}}}
 ];
 const result=inspectHARegistrySchemas(manifest);
 assert.equal(result.status,'schema_only');
 assert.equal(result.toolsCalled,0);
 assert.equal(result.fullRegistryAvailable,false);
 assert.equal(result.authorizeRead,false);
 assert.equal(result.authorizeWrite,false);
 assert.deepEqual(result.tools.find(x=>x.name==='ha_list_floors_areas').required,['floor_id']);
 assert.equal(result.tools.find(x=>x.name==='ha_list_floors_areas').extraFieldCount,1);
 assert.equal(result.tools.some(x=>x.name==='ha_call_service'),false);
 assert.equal(result.tools.find(x=>x.name==='ha_get_device').schema,'not_exposed');
 assert.equal(result.tools.length,TARGET_TOOL_NAMES.length);
 assert.doesNotMatch(JSON.stringify(result),/privateToken|service/);
});
test('invalid or adversarial schema objects are ignored conservatively',()=>{
 assert.throws(()=>inspectHARegistrySchemas({}),/invalid_mcp_manifest/);
 const out=inspectHARegistrySchemas([
  {name:'ha_get_entity',inputSchema:{type:'object',properties:{entity_id:{type:'string'},bogus:{type:'sneaky'}}}},
  {name:'ha_get_entity',inputSchema:{properties:{entity_id:{type:'integer'}}}},
  {name:'ha_get_zone',inputSchema:{}},
  {name:'ha_config_get_label',inputSchema:null},
  {name:'ha_call_service',inputSchema:{}}
 ]);
 assert.equal(out.reviewed,3);
 assert.equal(out.tools.find(x=>x.name==='ha_get_entity').fields[0].type,'string');
 assert.equal(out.tools.find(x=>x.name==='ha_get_entity').extraFieldCount,1);
 assert.equal(out.tools.find(x=>x.name==='ha_get_zone').schema,'present');
 assert.equal(out.tools.find(x=>x.name==='ha_config_get_label').schema,'missing_or_invalid');
});
test('operator command lists schemas without any MCP tool invocation or Telegram poller',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-ha-mcp-schema-audit.mjs',import.meta.url),'utf8');
 assert.match(src,/client\.listTools\(\)/);
 assert.doesNotMatch(src,/client\.callTool\(|bot\.launch\(|systemctl|\.dispatch\(/);
 assert.match(src,/TOOLS_CALLED=0/);
 assert.match(src,/HA_WRITES=NO/);
});
