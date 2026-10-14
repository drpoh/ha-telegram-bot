import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {authorizeEntityLabelProof,summarizeEntityLabelShape} from '../src/home/ha-entity-label-mcp-proof.mjs';
const manifest=[
 {name:'ha_get_entity',inputSchema:{type:'object',properties:{entity_id:{anyOf:[{type:'string'},{type:'array'},{type:'null'}]}}}},
 {name:'ha_config_get_label',inputSchema:{type:'object',properties:{label_id:{anyOf:[{type:'string'},{type:'null'}]}}}}
];
test('uses fixed previously reviewed entity and null label query, never open-ended controls',()=>{
 const a=authorizeEntityLabelProof(manifest);
 assert.equal(a.allowed,true);
 assert.equal(a.entityName,'ha_get_entity');
 assert.deepEqual(a.entityArgs,{entity_id:'light.tambur_svet_l1'});
 assert.deepEqual(a.labelArgs,{label_id:null});
 assert.equal(a.authorization,false);
 assert.equal(a.actualWrite,false);
});
test('rejects missing duplicate, or incompatible schemas',()=>{
 for(const tools of [
  [],[...manifest,manifest[0]],
  [{name:'ha_get_entity',inputSchema:{type:'object',properties:{entity_id:{type:'integer'}}}},manifest[1]],
  [manifest[0],{name:'ha_config_get_label',inputSchema:{type:'object',properties:{label_id:{type:'string'}},required:['secret']}}]
 ])assert.equal(authorizeEntityLabelProof(tools).allowed,false);
});
test('summaries expose only names and shapes, never values',()=>{
 const out=summarizeEntityLabelShape({structuredContent:{success:true,
  entities:[{entity_id:'light.private',name:'private room'}],
  token:'private-token',labels:[{name:'secret'}]}});
 assert.equal(out.status,'shape_only');
 assert.equal(out.actualWrite,false);
 assert.doesNotMatch(JSON.stringify(out),/private room|private-token|light.private|secret/);
 assert.equal(summarizeEntityLabelShape({isError:true,structuredContent:{}}).status,'unavailable');
});
test('operator script uses only two fixed read-only MCP calls',()=>{
 const code=readFileSync(new URL('../scripts/manual/v3-ha-entity-label-shape.mjs',import.meta.url),'utf8');
 assert.equal((code.match(/client\.callTool\(/g)||[]).length,1);
 assert.match(code,/authorizeEntityLabelProof\(manifest\.tools\)/);
 assert.doesNotMatch(code,/ha_call_service|bot\.launch\(|systemctl/);
});
