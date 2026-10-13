import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSingleNewLight} from '../src/home/single-new-light-status.mjs';

test('explicit kitchen light performs exactly one HA state read and never authorizes a write',async()=>{
 const calls=[];
 const r=await inspectSingleNewLight({entityId:'light.kukhnia_svet',readState:async id=>{
  calls.push(id);return {structuredContent:{data:{entity_id:id,state:'on'}}};
 }});
 assert.deepEqual(calls,['light.kukhnia_svet']);
 assert.equal(r.status,'complete');assert.equal(r.state,'on');
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.match(r.text,/light\.kukhnia_svet/);
 assert.match(r.text,/не подтверждение физического/);
 assert.match(r.text,/заблокировано/);
});
test('invalid, unlisted and browser_mod targets fail before any read',async()=>{
 let calls=0;const readState=()=>{calls++;throw Error('should not read');};
 for(const id of ['light.browser_mod_fake','light.tambur_svet_l1',
  'light.kukhnia_svet light.liustra','switch.vannaia_svet','LIGHT.KUKHNIA_SVET',undefined]){
  const r=await inspectSingleNewLight({entityId:id,readState});
  assert.equal(r.status,'unsupported');assert.equal(r.authorization,false);
  assert.equal(r.actualWrite,false);
 }
 assert.equal(calls,0);
});
test('unavailable, mismatched, malformed, and failed MCP responses are not OFF',async()=>{
 for(const response of [
  {data:{entity_id:'light.kukhnia_svet',state:'unavailable'}},
  {data:{entity_id:'light.kukhnia_svet',state:'unknown'}},
  {data:{entity_id:'light.some_other',state:'off'}},
  {isError:true,data:{entity_id:'light.kukhnia_svet',state:'off'}},
  {data:{entity_id:'light.kukhnia_svet',state:'invalid'}}
 ]){
  const r=await inspectSingleNewLight({entityId:'light.kukhnia_svet',readState:async()=>response});
  assert.equal(r.status,'partial');assert.equal(r.state,'unknown');
  assert.match(r.text,/нельзя считать выключенным/);
  assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
 const failed=await inspectSingleNewLight({entityId:'light.kukhnia_svet',readState:async()=>{throw Error('sensitive transport error');}});
 assert.equal(failed.status,'partial');assert.doesNotMatch(failed.text,/sensitive/);
});
test('an actual OFF state is reported as entity state, not physical identity',async()=>{
 const r=await inspectSingleNewLight({entityId:'light.kukhnia_svet',readState:async entity_id=>({data:{entity_id,state:'off'}})});
 assert.equal(r.state,'off');
 assert.match(r.text,/выключено \(off\)/);
 assert.match(r.text,/не подтверждение физического/);
});
