import test from 'node:test';import assert from 'node:assert/strict';import {summarizeSauna} from '../src/home/sauna-status.mjs';
const temp='sensor.sauna_te_sauna_temperature',ready='binary_sensor.sauna_sauna_te_sauna_ready';
test('sauna summary reads only two sensors and never writes',async()=>{
 const calls=[];
 const r=await summarizeSauna({readState:async id=>{calls.push(id);return {structuredContent:{entity_id:id,state:id===temp?'78.5':'off'}};}});
 assert.deepEqual(calls,[temp,ready]);assert.equal(r.temperature,78.5);assert.equal(r.ready,false);assert.equal(r.actualWrite,false);assert.match(r.text,/85 °C/);
});
test('sauna ready state is reported read-only',async()=>{
 const r=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:id===temp?'89':'on'}})});
 assert.equal(r.status,'complete');assert.equal(r.ready,true);assert.match(r.text,/готова/);
});
test('unavailable, wrong entity and implausible sensor values fail closed',async()=>{
 for(const state of ['unavailable','unknown','999','-90','NaN']){
  const r=await summarizeSauna({readState:async id=>({entity_id:id,state:id===temp?state:'off'})});
  assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);
 }
 const r=await summarizeSauna({readState:async id=>({entity_id:'sensor.fake',state:'80'})});
 assert.equal(r.status,'unavailable');
});

test('real HA-MCP data envelope accepts long-unchanged readiness state',async()=>{
 const result=await summarizeSauna({readState:async id=>({
  structuredContent:{data:{
   entity_id:id,
   state:id===temp?'75.875':'off',
   last_reported:id===temp?'2026-10-11T20:26:19+03:00':'2026-10-11T11:41:33+03:00',
   attributes:id===temp?{unit_of_measurement:'°C'}:{device_class:'heat'}
  }}
 })});
 assert.equal(result.status,'complete');
 assert.equal(result.temperature,75.875);
 assert.equal(result.ready,false);
 assert.equal(result.actualWrite,false);
});

test('focused temperature question reports only the scoped sensor value',async()=>{
 const ids=[];
 const r=await summarizeSauna({mode:'temperature',readState:async id=>{
  ids.push(id);
  return {structuredContent:{data:{entity_id:id,state:id===temp?'28.4375':'off'}}};
 }});
 assert.deepEqual(ids,[temp,ready]);
 assert.equal(r.status,'complete');assert.equal(r.temperature,28.4375);
 assert.equal(r.text,'Температура сауны: 28.4375 °C.');
 assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);
});

test('focused readiness answer uses authoritative sensor and accepted threshold',async()=>{
 const read=state=>summarizeSauna({mode:'ready',readState:async id=>({data:{entity_id:id,state:id===temp?'84':state}})});
 const no=await read('off');
 assert.equal(no.text,'Сауна ещё не готова. Порог готовности: 85 °C.');
 const yes=await read('on');
 assert.equal(yes.text,'Сауна готова. Порог готовности: 85 °C.');
 assert.equal(yes.actualWrite,false);assert.equal(yes.authorization,false);
});

test('partial/incorrect HA results cannot fabricate focused sauna readiness',async()=>{
 for(const mode of ['temperature','ready','status']){
  const r=await summarizeSauna({mode,readState:async id=>({
   data:{entity_id:id===ready?'binary_sensor.spoof':id,state:id===temp?'87':'on'}
  })});
  assert.equal(r.status,'unavailable');
  assert.equal(r.text,'Не удалось получить достоверное состояние сауны.');
  assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);
 }
});

test('existing full sauna status remains unchanged for /sauna and default mode',async()=>{
 const readState=async id=>({data:{entity_id:id,state:id===temp?'30.5':'off'}});
 const a=await summarizeSauna({readState});
 const b=await summarizeSauna({readState,mode:'status'});
 assert.equal(a.text,b.text);
 assert.equal(a.text,'Температура сауны: 30.5 °C. Сауна ещё не готова. Порог готовности: 85 °C.');
});

test('sauna status accepts all four HA-MCP data envelope structures',async()=>{
 const r1=await summarizeSauna({readState:async id=>({structuredContent:{data:{entity_id:id,state:id===temp?'80':'off'}}})});
 assert.equal(r1.status,'complete');assert.equal(r1.temperature,80);assert.equal(r1.ready,false);assert.equal(r1.authorization,false);assert.equal(r1.actualWrite,false);

 const r2=await summarizeSauna({readState:async id=>({structuredContent:{entity_id:id,state:id===temp?'80':'off'}})});
 assert.equal(r2.status,'complete');assert.equal(r2.temperature,80);assert.equal(r2.ready,false);assert.equal(r2.authorization,false);assert.equal(r2.actualWrite,false);

 const r3=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:id===temp?'80':'off'}})});
 assert.equal(r3.status,'complete');assert.equal(r3.temperature,80);assert.equal(r3.ready,false);assert.equal(r3.authorization,false);assert.equal(r3.actualWrite,false);

 const r4=await summarizeSauna({readState:async id=>({entity_id:id,state:id===temp?'80':'off'})});
 assert.equal(r4.status,'complete');assert.equal(r4.temperature,80);assert.equal(r4.ready,false);assert.equal(r4.authorization,false);assert.equal(r4.actualWrite,false);
});

test('sauna status fails closed on invalid readState parameter, errors, exceptions, and non-string states',async()=>{
 for(const badFn of [undefined, null, 123, 'fn', {}]){
  const r=await summarizeSauna({readState:badFn});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }

 for(const badVal of [null, undefined, 42, 'str', true, []]){
  const r=await summarizeSauna({readState:async()=>badVal});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }

 const rThrow=await summarizeSauna({readState:async()=>{throw new Error('read failed');}});
 assert.equal(rThrow.status,'unavailable');assert.equal(rThrow.authorization,false);assert.equal(rThrow.actualWrite,false);

 const rErr=await summarizeSauna({readState:async id=>({isError:true,structuredContent:{entity_id:id,state:id===temp?'80':'off'}})});
 assert.equal(rErr.status,'unavailable');assert.equal(rErr.authorization,false);assert.equal(rErr.actualWrite,false);

 for(const nonStringState of [100, true, false, null, undefined, {}]){
  const r=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:nonStringState}})});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});

test('sauna status boundary and temperature fault validation',async()=>{
 const rMin=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:id===temp?'-40':'off'}})});
 assert.equal(rMin.status,'complete');assert.equal(rMin.temperature,-40);

 const rMax=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:id===temp?'150':'off'}})});
 assert.equal(rMax.status,'complete');assert.equal(rMax.temperature,150);

 for(const badTemp of ['-40.1', '150.1', '-100', '200', '9999', 'abc', '12.3.4']){
  const r=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:id===temp?badTemp:'off'}})});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }

 for(const badReady of ['standby', 'heating', 'ON', 'OFF', '1', '0', 'true', 'false', 'unavailable', 'unknown']){
  const r=await summarizeSauna({readState:async id=>({data:{entity_id:id,state:id===temp?'80':badReady}})});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});
