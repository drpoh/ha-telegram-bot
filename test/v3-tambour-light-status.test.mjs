import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeTambourLight} from '../src/home/tambour-light-status.mjs';
const id='light.tambur_svet_l1';
test('reads only existing authorized lamp, no writes, and reports on',async()=>{
 const calls=[];const r=await summarizeTambourLight({readState:async entity=>{calls.push(entity);return {structuredContent:{data:{entity_id:entity,state:'on'}}};}});
 assert.deepEqual(calls,[id]);assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);assert.equal(r.on,true);assert.match(r.text,/включён/);
});
test('reports off for exact target from plain MCP envelope',async()=>{
 const r=await summarizeTambourLight({readState:async entity=>({entity_id:entity,state:'off'})});
 assert.equal(r.status,'complete');assert.equal(r.on,false);assert.match(r.text,/выключен/);
});
test('denies errors, bad states, wrong scope, and failing reads',async()=>{
 const cases=[
  {isError:true,structuredContent:{data:{entity_id:id,state:'on'}}},
  {data:{entity_id:'light.other',state:'on'}},
  {data:{entity_id:id,state:'unavailable'}},
  {data:{entity_id:id,state:'unknown'}},
  {data:{entity_id:id,state:42}},
  {},
 ];
 for(const value of cases){const r=await summarizeTambourLight({readState:async()=>value});assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);}
 const failure=await summarizeTambourLight({readState:async()=>{throw new Error('connection');}});assert.equal(failure.status,'unavailable');
});

test('direct tambour yes/no stays bounded to one HA read',async()=>{
 const ids=[];
 for(const state of ['on','off']){
  const r=await summarizeTambourLight({mode:'yes_no',readState:async entity=>{
   ids.push(entity);return {data:{entity_id:entity,state}};
  }});
  assert.equal(r.status,'complete');
  assert.equal(r.text,state==='on'?'Да, свет в тамбуре включён.':'Нет, свет в тамбуре выключен.');
  assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
 assert.deepEqual(ids,[id,id]);
});
test('unknown tambo(u)r state never replies yes or no',async()=>{
 const r=await summarizeTambourLight({mode:'yes_no',readState:async entity=>({data:{entity_id:entity,state:'unavailable'}})});
 assert.equal(r.status,'unavailable');
 assert.match(r.text,/Не удалось достоверно/);
 assert.doesNotMatch(r.text,/^(Да|Нет),/);
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});
test('default /light detail remains unchanged',async()=>{
 const readState=async entity=>({data:{entity_id:entity,state:'off'}});
 assert.equal((await summarizeTambourLight({readState})).text,(await summarizeTambourLight({readState,mode:'status'})).text);
});

test('tambour light status accepts all four HA-MCP envelope variants',async()=>{
 const r1=await summarizeTambourLight({readState:async entity=>({structuredContent:{data:{entity_id:entity,state:'on'}}})});
 assert.equal(r1.status,'complete');assert.equal(r1.on,true);assert.equal(r1.authorization,false);assert.equal(r1.actualWrite,false);

 const r2=await summarizeTambourLight({readState:async entity=>({structuredContent:{entity_id:entity,state:'on'}})});
 assert.equal(r2.status,'complete');assert.equal(r2.on,true);assert.equal(r2.authorization,false);assert.equal(r2.actualWrite,false);

 const r3=await summarizeTambourLight({readState:async entity=>({data:{entity_id:entity,state:'on'}})});
 assert.equal(r3.status,'complete');assert.equal(r3.on,true);assert.equal(r3.authorization,false);assert.equal(r3.actualWrite,false);

 const r4=await summarizeTambourLight({readState:async entity=>({entity_id:entity,state:'on'})});
 assert.equal(r4.status,'complete');assert.equal(r4.on,true);assert.equal(r4.authorization,false);assert.equal(r4.actualWrite,false);
});

test('tambour light status fails closed on invalid readState parameter, errors, exceptions, and invalid states',async()=>{
 for(const badFn of [undefined, null, 123, 'fn', {}]){
  const r=await summarizeTambourLight({readState:badFn});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
  assert.equal(r.text,'Не удалось достоверно определить состояние света в тамбуре.');
 }

 for(const badVal of [null, undefined, 100, 'str', true, false, []]){
  const r=await summarizeTambourLight({readState:async()=>badVal});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }

 const rThrow=await summarizeTambourLight({readState:async()=>{throw new Error('connection lost');}});
 assert.equal(rThrow.status,'unavailable');assert.equal(rThrow.authorization,false);assert.equal(rThrow.actualWrite,false);

 const rErr=await summarizeTambourLight({readState:async entity=>({isError:true,structuredContent:{entity_id:entity,state:'on'}})});
 assert.equal(rErr.status,'unavailable');assert.equal(rErr.authorization,false);assert.equal(rErr.actualWrite,false);

 for(const badId of ['light.koridor', 'light.tambur_svet_l2', 'light.other', 'sensor.tambur']){
  const r=await summarizeTambourLight({readState:async()=>({data:{entity_id:badId,state:'on'}})});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }

 for(const badState of [true, false, 1, 0, null, undefined, {}, 'ON', 'OFF', 'standby', 'dimmed', 'unavailable', 'unknown', '1', '0']){
  const r=await summarizeTambourLight({readState:async entity=>({data:{entity_id:entity,state:badState}})});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
  assert.equal(r.on, undefined);
 }
});
