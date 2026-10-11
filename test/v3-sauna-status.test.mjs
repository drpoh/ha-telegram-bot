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
