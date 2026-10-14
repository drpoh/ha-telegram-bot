import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditKnownMCPArgumentShapes} from '../src/home/ha-mcp-argument-shapes.mjs';
test('audit complex union input without dumping secret names or enum values',()=>{
 const report=auditKnownMCPArgumentShapes([
  {name:'ha_get_entity',inputSchema:{type:'object',properties:{
   entity_id:{anyOf:[{type:'string'},{type:'array',items:{type:'string'}}]},
   domain:{type:['string','null']},api_key:{type:'string'},query:{type:'string',enum:['secret value']}
  },required:['entity_id','api_key']}},
  {name:'ha_get_device',inputSchema:{type:'object',properties:{device_id:{type:'string'}}}},
  {name:'ha_search',inputSchema:{type:'object',properties:{query:{oneOf:[{type:'string'},{type:'object'}]}}}},
  {name:'ha_config_get_label',inputSchema:{type:'object',properties:{label_id:{type:'string'}}}}
 ]);
 assert.equal(report.toolsCalled,0);
 assert.equal(report.haWrites,0);
 const entity=report.tools.find(x=>x.name==='ha_get_entity');
 assert.equal(entity.status,'shape_only');
 assert.equal(entity.unknownRequiredCount,1);
 assert.deepEqual(entity.requiredKnown,['entity_id']);
 assert.ok(entity.supported.some(x=>x.key==='entity_id'&&x.type==='anyOf:string|array'));
 assert.doesNotMatch(JSON.stringify(report),/api_key|secret value/);
});
test('missing or duplicated tools do not become authorized',()=>{
 const x=auditKnownMCPArgumentShapes([{name:'ha_search'},{name:'ha_get_device',inputSchema:{properties:{}}},{name:'ha_search'}]);
 assert.equal(x.tools.find(t=>t.name==='ha_search').status,'missing_or_duplicate');
 assert.equal(x.tools.find(t=>t.name==='ha_get_device').status,'shape_only');
 assert.equal(x.tools.find(t=>t.name==='ha_get_entity').status,'missing_or_duplicate');
 assert.throws(()=>auditKnownMCPArgumentShapes(null),/invalid_mcp_manifest/);
});
test('live operator script only calls listTools, never any HA tool',()=>{
 const source=readFileSync(new URL('../scripts/manual/v3-ha-mcp-argument-shapes.mjs',import.meta.url),'utf8');
 assert.match(source,/client\.listTools\(\)/);
 assert.doesNotMatch(source,/client\.callTool\(|ha_call_service|bot\.launch\(|systemctl/);
});
