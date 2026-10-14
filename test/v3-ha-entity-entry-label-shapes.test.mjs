import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectEntityEntryShape,inspectLabelListShape,classifyReviewedLabels} from '../src/home/ha-entity-entry-label-shapes.mjs';
test('entity entry fields never contain identities or sensitive values',()=>{
 const r=inspectEntityEntryShape({structuredContent:{success:true,entity_entry:{
  entity_id:'light.secret',area_id:'secret_room',labels:['lighting'],device_id:'hidden-device',
  disabled_by:null,hidden_by:null,friendly_name:'Private'
 }}});
 assert.equal(r.status,'entity_shape_only');
 assert.equal(r.completeRegistry,false);
 assert.equal(r.authorization,false);
 assert.ok(r.fields.some(f=>f.key==='labels'&&f.type==='array'&&f.count===1));
 assert.doesNotMatch(JSON.stringify(r),/light.secret|secret_room|hidden-device|Private/);
});
test('label list count matches array and names are classified but not printed',()=>{
 const raw={structuredContent:{success:true,count:4,labels:[
  {label_id:'l1',name:'Освещение',description:'secret'},
  {label_id:'l2',name:'Управление'},
  {label_id:'l3',name:'Системный'},
  {label_id:'l4',name:'Unrelated'}
 ]}};
 const shape=inspectLabelListShape(raw);
 assert.equal(shape.status,'label_list_shape_only');
 assert.equal(shape.count,4);
 assert.deepEqual(classifyReviewedLabels(raw.structuredContent.labels).totals,{
  lighting:1,control:1,system:1,other:1
 });
 assert.doesNotMatch(JSON.stringify(shape),/secret|Unrelated/);
 assert.equal(classifyReviewedLabels(raw.structuredContent.labels).authorizesWrite,false);
});
test('mismatched, duplicate and invalid data fails closed',()=>{
 assert.equal(inspectEntityEntryShape({structuredContent:{success:false,entity_entry:{}}}).status,'unavailable');
 assert.equal(inspectLabelListShape({structuredContent:{success:true,count:3,labels:[]}}).status,'unavailable');
 assert.equal(classifyReviewedLabels([{label_id:'a',name:'Освещение'},{label_id:'a',name:'Системный'}]).status,'invalid');
 assert.equal(classifyReviewedLabels(null).status,'invalid');
});
test('operator script contains exactly two scoped calls and no HA mutation',()=>{
 const source=readFileSync(new URL('../scripts/manual/v3-ha-entry-label-structure.mjs',import.meta.url),'utf8');
 assert.equal((source.match(/client\.callTool\(/g)||[]).length,2);
 assert.match(source,/authorizeEntityLabelProof\(tools\)/);
 assert.doesNotMatch(source,/ha_call_service|bot\.launch\(|systemctl/);
});
