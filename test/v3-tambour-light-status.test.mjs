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
