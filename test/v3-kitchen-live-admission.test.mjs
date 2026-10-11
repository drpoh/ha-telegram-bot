import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenLiveAdmission} from '../src/pilot/kitchen-live-admission.mjs';
const verify=createKitchenLiveAdmission({expectedSha256:'incorrect',registryReader:async()=>{throw Error('should not read registry')}});
test('invalid pinned owner policy rejects admission before registry',async()=>{
 const r=await verify({name:'ha_call_service',args:{domain:'light',entity_id:'light.tambur_svet_l1',service:'turn_on'}});
 assert.equal(r.valid,false);
});
test('out of scope device rejected before registry',async()=>{
 const r=await verify({name:'ha_call_service',args:{domain:'light',entity_id:'light.kukhnia_svet',service:'turn_on'}});
 assert.equal(r.valid,false);
});
