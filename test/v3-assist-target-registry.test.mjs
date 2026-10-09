import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyAssistReadTarget} from '../src/decision/v3-assist-target-registry.mjs';
const entity={entityId:'light.fixture',areaId:'sauna',deviceId:'dev1',available:true,disabled:false};
const snapshot={success:true,complete:true,partial:false,capturedAt:1000,entities:[entity]};
const check=(changes={})=>verifyAssistReadTarget({snapshot,entityId:'light.fixture',areaId:'sauna',now:1010,...changes});
test('verified read-only target is not execution authority',()=>assert.equal(check().status,'read_target_verified_only'));
test('partial, stale, future and missing evidence denies',()=>{
 for(const v of [{complete:false},{partial:true},{capturedAt:1},{entities:[]},{entities:[entity,entity]}])
  assert.equal(check({snapshot:{...snapshot,...v},now:v.capturedAt===1?50000:1010}).allowed,false);
 assert.equal(check({now:999}).allowed,false);
});
test('wrong area, unavailable, disabled and missing device deny',()=>{
 for(const v of [{areaId:'kitchen'},{available:false},{disabled:true},{deviceId:''}])
  assert.equal(check({snapshot:{...snapshot,entities:[{...entity,...v}]}}).allowed,false);
});
test('not a light entity or matching room cannot broaden read scope',()=>{
 assert.equal(check({entityId:'switch.fixture'}).allowed,false);
 assert.equal(check({areaId:'kitchen'}).allowed,false);
});
test('pagination, count mismatch and invalid clock settings fail closed',()=>{
 for(const v of [{has_more:true},{next_offset:1},{entityCount:2},{entityCount:-1}])
  assert.equal(check({snapshot:{...snapshot,...v}}).allowed,false);
 for(const v of [0,-1,30001,NaN,1.5])
  assert.equal(check({maxAgeMs:v}).allowed,false);
});
test('a malformed unrelated registry member invalidates the whole snapshot',()=>{
 for(const bad of [{...entity,entityId:'switch.hidden'},{...entity,entityId:'light.second',areaId:''},{...entity,entityId:'light.second',available:'yes'},{...entity,entityId:'light.second',deviceId:''}])
  assert.equal(check({snapshot:{...snapshot,entities:[entity,bad]}}).allowed,false);
});
