import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewedSatelliteAreaFixture} from '../src/decision/v3-satellite-area-fixture.mjs';
import {createAssistReadonlyRoute} from '../src/decision/v3-assist-readonly-route.mjs';
const review=createReviewedSatelliteAreaFixture({entries:[{satelliteId:'m5stack-echo',areaId:'sauna',reviewed:true}]});
const snapshot={success:true,complete:true,partial:false,capturedAt:1000,devices:[{satelliteId:'m5stack-echo',deviceId:'device-1',areaId:'sauna',available:true,disabled:false}]};
const make=(changes={})=>createAssistReadonlyRoute({knownSatellites:['m5stack-echo'],review,registrySnapshot:snapshot,clock:()=>1010,readTool:async()=>{throw Error('must_not_call');},...changes});
const input={satelliteId:'m5stack-echo',transcript:'Какое состояние света?',entityId:'light.fixture'};
test('Gate E: valid satellite only yields plan for separate entity authorization',async()=>{
 const result=await make().handle(input);
 assert.equal(result.status,'review');assert.equal(result.areaId,'sauna');assert.equal(result.reason,'target_registry_authorization_required');
});
test('Gate E: HA write tool always denied, even when satellite is registered',async()=>{
 let calls=0;const route=make({readTool:async()=>{calls++;}});
 assert.equal((await route.handle({...input,toolName:'ha_call_service'})).status,'denied');assert.equal(calls,0);
});
test('Gate E: unknown satellite and stale HA registry deny',async()=>{
 assert.equal((await make().handle({...input,satelliteId:'unknown'})).status,'denied');
 assert.equal((await make({clock:()=>100000}).handle(input)).status,'denied');
});
test('Gate E: cannot turn transcript into cross-domain tool access',async()=>{
 assert.equal((await make().handle({...input,entityId:'switch.lock'})).status,'denied');
 assert.equal((await make().handle({...input,toolName:'ha_config_set_automation'})).status,'denied');
});
