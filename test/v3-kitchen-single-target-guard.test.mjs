import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectKitchenSingleTarget} from '../src/pilot/kitchen-single-target-guard.mjs';
const action={name:'ha_call_service',args:{domain:'light',entity_id:'light.tambur_svet_l1',service:'turn_on'}};
const yes=async()=>({valid:true});
test('selected pilot target is still never authorized by fixture evidence',async()=>{
 const r=await inspectKitchenSingleTarget({action,verifyRegistry:yes,verifyOwner:yes,verifyTelegram:yes});
 assert.equal(r.allowed,false);assert.equal(r.reason,'isolated_fixture_only_no_live_authority');
});
test('reject other entities, actions, missing or failed approval checks',async()=>{
 for(const id of ['light.svet_kukhni','light.kukhnia_svet','light.ves_svet'])
  assert.equal((await inspectKitchenSingleTarget({action:{...action,args:{...action.args,entity_id:id}}})).reason,'action_outside_pilot');
 assert.equal((await inspectKitchenSingleTarget({action,verifyRegistry:yes,verifyOwner:yes})).reason,'missing_trusted_verifier');
 assert.equal((await inspectKitchenSingleTarget({action,verifyRegistry:yes,verifyOwner:async()=>({valid:false}),verifyTelegram:yes})).reason,'owner_verification_failed');
});
