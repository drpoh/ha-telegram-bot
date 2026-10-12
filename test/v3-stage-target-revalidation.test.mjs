import test from 'node:test';
import assert from 'node:assert/strict';
import {revalidateStageTarget} from '../src/decision/v3-stage-target-revalidation.mjs';
import {createV3IntentLedger} from '../src/decision/v3-intent-ledger.mjs';
const now=1791710000000;
const e=(id='light.tambur_1',deviceId='zigbee-1',available=true)=>({entityId:id,name:'Свет',areaId:'tambur',deviceId,available,disabled:false});
const snapshot=(entities,time=now)=>({complete:true,partial:false,has_more:false,next_offset:null,capturedAt:time,entities});
const check=(first,second)=>revalidateStageTarget({initialSnapshot:first,currentSnapshot:second,name:'Свет',areaId:'tambur',now});
test('same target twice produces a non-authorizing candidate',()=>{
 const r=check(snapshot([e()]),snapshot([e()]));
 assert.deepEqual(r,{status:'candidate_revalidated',authorized:false,entityId:'light.tambur_1',deviceId:'zigbee-1',areaId:'tambur'});
});
test('replacement device with same entity ID blocks',()=>assert.equal(check(snapshot([e()]),snapshot([e('light.tambur_1','replaced')])).reason,'target_identity_changed'));
test('target missing, unavailable or disabled between reads blocks',()=>{
 assert.equal(check(snapshot([e()]),snapshot([])).reason,'current_target_not_found');
 assert.equal(check(snapshot([e()]),snapshot([e('light.tambur_1','zigbee-1',false)])).reason,'current_target_disabled_or_unavailable');
 assert.equal(check(snapshot([e()]),snapshot([{...e(),disabled:true}])).reason,'current_target_disabled_or_unavailable');
});
test('stale current snapshot or newly ambiguous initial name blocks',()=>{
 assert.equal(check(snapshot([e()]),snapshot([e()],now-30001)).reason,'current_stale_or_incomplete_registry');
 assert.equal(check(snapshot([e(),e('light.tambur_2','zigbee-2')]),snapshot([e()])).reason,'initial_ambiguous_target');
});
test('concurrent claims consume one intent at most once, other actors fail',async()=>{
 const ledger=createV3IntentLedger({clock:()=>now});
 const actor={userId:42,chatId:42};
 const issue=ledger.issue({...actor,userText:'Выключи свет',action:{name:'ha_call_service',args:{domain:'light',entity_id:'light.tambur_1',service:'turn_off'}}});
 const attempts=await Promise.all(Array.from({length:20},()=>Promise.resolve().then(()=>ledger.consume({...actor,token:issue.token}))));
 assert.equal(attempts.filter(Boolean).length,1);
 assert.equal(ledger.consume({userId:43,chatId:43,token:issue.token}),null);
});
test('later intent invalidates previously issued token',()=>{
 const ledger=createV3IntentLedger({clock:()=>now});
 const actor={userId:42,chatId:42},action={name:'ha_call_service',args:{domain:'light',entity_id:'light.tambur_1',service:'turn_off'}};
 const old=ledger.issue({...actor,userText:'old',action});const recent=ledger.issue({...actor,userText:'new',action});
 assert.equal(ledger.consume({...actor,token:old.token}),null);
 assert.notEqual(ledger.consume({...actor,token:recent.token}),null);
});
