import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveStageLight as resolve} from '../src/decision/v3-stage-target-resolution.mjs';
const now=1791710000000;
const entities=[
 {entityId:'light.tambur_svet_l1',name:'Свет',areaId:'tambur',deviceId:'driver1',available:true,disabled:false},
 {entityId:'light.tambur_svet_l2',name:'Свет',areaId:'tambur',deviceId:'driver2',available:true,disabled:false},
 {entityId:'light.kitchen_svet',name:'Свет',areaId:'kitchen',deviceId:'driver3',available:true,disabled:false},
];
const snap=items=>({complete:true,partial:false,has_more:false,next_offset:null,capturedAt:now,entities:items});
test('exact ID plus reviewed area yields a non-authorizing candidate',()=>{
 const r=resolve({snapshot:snap(entities),name:'light.tambur_svet_l1',areaId:'tambur',now});
 assert.deepEqual(r,{status:'candidate',authorized:false,entityId:'light.tambur_svet_l1',deviceId:'driver1',areaId:'tambur'});
});
test('same named devices never silently pick the first',()=>assert.equal(resolve({snapshot:snap(entities),name:'Свет',areaId:'tambur',now}).reason,'ambiguous_target'));
test('room context disambiguates only when exact unique',()=>assert.equal(resolve({snapshot:snap(entities),name:'свет',areaId:'kitchen',now}).entityId,'light.kitchen_svet'));
test('wrong area and fuzzy substrings do not resolve',()=>{
 assert.equal(resolve({snapshot:snap(entities),name:'light.kitchen_svet',areaId:'tambur',now}).reason,'target_not_found');
 assert.equal(resolve({snapshot:snap(entities),name:'свет кухни',areaId:'kitchen',now}).reason,'target_not_found');
});
test('stale, incomplete, partial and pagination deny',()=>{
 for(const s of [{...snap(entities),capturedAt:now-30001},{...snap(entities),partial:true},{...snap(entities),complete:false},{...snap(entities),has_more:true}])
  assert.equal(resolve({snapshot:s,name:'Свет',areaId:'kitchen',now}).reason,'stale_or_incomplete_registry');
});
test('unavailable or disabled exact targets deny',()=>{
 for(const flag of ['disabled','available']){
  const x={...entities[0],[flag]:flag==='disabled'};
  assert.equal(resolve({snapshot:snap([x]),name:x.entityId,areaId:'tambur',now}).reason,'target_disabled_or_unavailable');
 }
});
test('duplicate entity IDs and malformed records deny',()=>{
 assert.equal(resolve({snapshot:snap([entities[0],entities[0]]),name:entities[0].entityId,areaId:'tambur',now}).reason,'invalid_registry');
 assert.equal(resolve({snapshot:snap([{...entities[0],deviceId:''}]),name:entities[0].entityId,areaId:'tambur',now}).reason,'invalid_registry');
});
