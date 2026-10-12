import test from 'node:test';
import assert from 'node:assert/strict';
import {assessReadonlyInventory,INVENTORY_DOMAINS} from '../src/home/readonly-inventory-assessment.mjs';
const result=(domain,ids)=>({structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:ids.length,entities:ids.map(entity_id=>({entity_id,domain}))}});
test('inventory covers light, switch and two sensor domains but grants nothing',()=>{
 assert.deepEqual(INVENTORY_DOMAINS,['light','switch','sensor','binary_sensor']);
 for(const domain of INVENTORY_DOMAINS){
  const r=assessReadonlyInventory({domain,result:result(domain,[domain+'.test_one',domain+'.test_two'])});
  assert.equal(r.status,'complete');assert.equal(r.count,2);
  assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
  assert.ok(r.candidates.every(c=>c.review==='unclassified'));
 }
});
test('partial/paginated/errors/lying totals are never presented as complete',()=>{
 const base=result('light',['light.one']);
 for(const raw of [
  {...base.structuredContent,partial:true},
  {...base.structuredContent,entity_has_more:true},
  {...base.structuredContent,entity_total_matches:2},
  {...base.structuredContent,success:false},
  {isError:true,structuredContent:base.structuredContent},
  {...base.structuredContent,entity_total_matches:501},
  {...base.structuredContent,entities:[{entity_id:'sensor.other',domain:'light'}]},
  {...base.structuredContent,entities:[{entity_id:'light.one',domain:'sensor'}]}
 ]){
  const r=assessReadonlyInventory({domain:'light',result:raw});
  assert.equal(r.status,'unverified');assert.deepEqual(r.candidates,[]);
  assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});
test('reject duplicate and malformed IDs, no guessed physical classification',()=>{
 const invalid=[
  result('sensor',['sensor.same','sensor.same']),
  result('switch',['switch.bad;rm']),
  result('light',['light.']),
 ];
 for(const input of invalid){
  const domain=input.structuredContent.entities[0].domain;
  const r=assessReadonlyInventory({domain,result:input});
  assert.equal(r.status,'unverified');
 }
 const r=assessReadonlyInventory({domain:'light',result:result('light',['light.bathroom_led'])});
 assert.equal(r.candidates[0].review,'unclassified');
 assert.equal(r.candidates[0].entity_id,'light.bathroom_led');
 assert.equal(assessReadonlyInventory({domain:'lock',result:result('lock',['lock.front'])}).status,'unverified');
});
