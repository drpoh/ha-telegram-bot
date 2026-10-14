import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {admitEntityDomainMetadata,inspectEntityDomainReply} from '../src/home/ha-entity-domain-mcp-proof.mjs';
const manifest=[{name:'ha_get_entity',inputSchema:{
 type:'object',properties:{
  domain:{anyOf:[{type:'string'},{type:'null'}]},
  entity_id:{anyOf:[{type:'string'},{type:'array'},{type:'null'}]}
 }
}}];
test('single fixed light domain, no unbounded entity or action authority',()=>{
 const admitted=admitEntityDomainMetadata({manifest,domain:'light'});
 assert.equal(admitted.allowed,true);
 assert.equal(admitted.tool,'ha_get_entity');
 assert.deepEqual(admitted.args,{domain:'light'});
 assert.equal(admitted.registryComplete,false);
 assert.equal(admitted.authorizesRead,false);
 assert.equal(admitted.authorizesWrite,false);
});
test('deny unknown domains, duplicates and required entity IDs',()=>{
 assert.equal(admitEntityDomainMetadata({manifest,domain:'lock'}).allowed,false);
 assert.equal(admitEntityDomainMetadata({manifest:[...manifest,...manifest]}).allowed,false);
 const required=structuredClone(manifest);required[0].inputSchema.required=['entity_id'];
 assert.equal(admitEntityDomainMetadata({manifest:required}).allowed,false);
 const invalid=structuredClone(manifest);invalid[0].inputSchema.properties.domain={type:'integer'};
 assert.equal(admitEntityDomainMetadata({manifest:invalid}).allowed,false);
});
test('shape-only output never emits underlying names, states or credentials',()=>{
 const result=inspectEntityDomainReply({structuredContent:{
  success:true,entity_entries:[{entity_id:'light.private',area:'Bedroom',state:'on'}],
  message:'owner private info',token:'do-not-log',count:1
 }});
 assert.equal(result.status,'shape_only');
 assert.equal(result.registryComplete,false);
 assert.equal(result.authorizesWrite,false);
 assert.deepEqual(result.fields.find(x=>x.key==='entity_entries').itemKeys,['area','entity_id','state']);
 assert.doesNotMatch(JSON.stringify(result),/light.private|Bedroom|owner private info|do-not-log/);
 assert.equal(inspectEntityDomainReply({isError:true,structuredContent:{}}).status,'unavailable');
});
test('operator audit can call only a fixed HA read, no Telegram poller',()=>{
 const source=readFileSync(new URL('../scripts/manual/v3-ha-entity-domain-proof.mjs',import.meta.url),'utf8');
 assert.equal((source.match(/client\.callTool\(/g)||[]).length,1);
 assert.match(source,/domain:'light'/);
 assert.doesNotMatch(source,/ha_call_service|bot\.launch\(|systemctl/);
});
