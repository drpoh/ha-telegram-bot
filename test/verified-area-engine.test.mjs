import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../src/decision/engine.mjs';
const policy={'light.hall':'auto_safe'};
const proposal={action:'ha_call_service',policyKey:'light.hall',args:{domain:'light',service:'turn_off',entity_id:['light.a','light.b']}};
const evidence={userRequestedArea:true,areaResolved:true,discovery:{allowed:true,status:'verified_read_only',entityIds:['light.a','light.b']}};
test('area evidence does not independently grant policy authorization',()=>{
 const d=decide(proposal,{}, {areaEvidence:evidence});
 assert.equal(d.executable,false);
});
test('verified area still obeys policy',()=>{
 const d=decide(proposal,policy,{areaEvidence:evidence});
 assert.equal(d.areaScope.allowed,true);
});
test('unverified area forces DENY even if policy approved',()=>{
 const d=decide(proposal,policy,{areaEvidence:{...evidence,areaResolved:false}});
 assert.equal(d.outcome,'deny');
 assert.equal(d.executable,false);
});
test('partial room request fails closed before any execution',()=>{
 const d=decide({...proposal,args:{...proposal.args,entity_id:'light.a'}},policy,{areaEvidence:evidence});
 assert.equal(d.areaScope.status,'partial_area_action');
 assert.equal(d.executable,false);
});
