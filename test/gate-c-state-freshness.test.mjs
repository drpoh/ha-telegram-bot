import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyConfirmedLightResult} from '../src/decision/confirmed-result-verification.mjs';

const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
const serviceResult={structuredContent:{success:true}};
const boundary=Date.parse('2026-10-10T08:00:00.000Z');
const verify=(state,options={})=>verifyConfirmedLightResult({
 action,serviceResult,minObservedAtMs:boundary,
 readState:async()=>({data:{entity_id:'light.fixture',state:'on',...state}}),...options,
});
test('Gate C: observed state before command boundary is not post-action proof',async()=>{
 const result=await verify({last_updated:'2026-10-10T07:59:59.999Z'});
 assert.equal(result.verified,false);
 assert.equal(result.status,'state_stale_or_unproven');
});
test('Gate C: missing or unparseable freshness timestamp denies verification',async()=>{
 for(const state of [{},{last_updated:null},{last_updated:'not-a-date'},{last_updated:boundary}]){
  assert.equal((await verify(state)).status,'state_stale_or_unproven');
 }
});
test('Gate C: matching fresh state is eligible for verification, mismatched state is not',async()=>{
 assert.equal((await verify({last_updated:'2026-10-10T08:00:00.000Z'})).verified,true);
 const result=await verify({last_updated:'2026-10-10T08:00:01.000Z',state:'off'});
 assert.equal(result.status,'state_pending');
});
test('Gate C: invalid boundary fails closed even with matching state',async()=>{
 for(const bad of [NaN,-1,Infinity,'2026-10-10T08:00:00Z']){
  const result=await verify({last_updated:'2026-10-10T08:00:10Z'},{minObservedAtMs:bad});
  assert.equal(result.status,'invalid_freshness_boundary');
 }
});
test('Gate C: legacy opt-out does not falsely claim freshness',async()=>{
 const result=await verify({}, {minObservedAtMs:undefined});
 assert.equal(result.verified,true);
 // Existing callers have not opted in and must not interpret this as fresh-state evidence.
});
