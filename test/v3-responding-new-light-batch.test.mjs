import test from 'node:test';
import assert from 'node:assert/strict';
import {RESPONDING_NEW_LIGHT_IDS,UNAVAILABLE_NEW_LIGHT_IDS,reviewedVisibleLights} from '../src/home/responding-new-light-batch.mjs';
import {planManualLightAction} from '../src/home/manual-light-action-plan.mjs';
test('all nine responsive lights included exactly once and unavailable excluded',()=>{
 const r=reviewedVisibleLights();
 assert.equal(r.status,'ready_for_identity_review');
 assert.deepEqual(r.targets.map(x=>x.id),RESPONDING_NEW_LIGHT_IDS);
 assert.equal(new Set(RESPONDING_NEW_LIGHT_IDS).size,9);
 assert.equal(UNAVAILABLE_NEW_LIGHT_IDS.length,10);
 assert.ok(RESPONDING_NEW_LIGHT_IDS.every(x=>!UNAVAILABLE_NEW_LIGHT_IDS.includes(x)&&!x.startsWith('light.browser_mod')));
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});
test('batch selection never silently approves physical action',()=>{
 const proposed=planManualLightAction({entityId:'light.wled_gledopto',action:'on',ownerSelectedIds:RESPONDING_NEW_LIGHT_IDS});
 assert.equal(proposed.status,'denied');assert.equal(proposed.actualWrite,false);
});
