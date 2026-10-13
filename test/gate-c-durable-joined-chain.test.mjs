import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createGateCExecutionJournal,simulateGateCClaimedDispatch} from '../src/decision/v3-gate-c-execution-journal.mjs';
import {verifyConfirmedLightResult} from '../src/decision/confirmed-result-verification.mjs';

const actionId='gate-c-frozen-action-98765';
const action=Object.freeze({name:'ha_call_service',args:Object.freeze({domain:'light',service:'turn_off',entity_id:'light.fixture'})});
const fixture=()=>{const dir=mkdtempSync(join(tmpdir(),'gate-c-joined-'));return {db:join(dir,'stage.db'),close:()=>rmSync(dir,{recursive:true,force:true})};};
const initial=Date.parse('2026-10-10T08:00:00.000Z');
test('Gate C joined: one admitted mock write, strictly fresh readback, durable replay refusal',async()=>{
 const f=fixture();try{
  const journal=createGateCExecutionJournal({dbPath:f.db});let writes=0;
  const run=()=>simulateGateCClaimedDispatch({journal,actionId,
   admit:async()=>true,
   invoke:async()=>{writes++;return {success:true};},
   verify:async result=>(await verifyConfirmedLightResult({action,serviceResult:result,
    minObservedAtMs:initial,
    readState:async()=>({data:{entity_id:'light.fixture',state:'off',last_updated:'2026-10-10T08:00:01Z'}})})).verified,
  });
  const all=await Promise.all(Array.from({length:7},run));
  assert.equal(all.filter(v=>v.status==='verified').length,1);
  assert.equal(all.filter(v=>v.status==='duplicate_or_unavailable').length,6);
  assert.equal(writes,1);
  assert.equal(createGateCExecutionJournal({dbPath:f.db}).inspect(actionId),'verified');
 }finally{f.close();}
});
test('Gate C joined: stale HA readback remains unverified and cannot cause second write',async()=>{
 const f=fixture();try{
  const journal=createGateCExecutionJournal({dbPath:f.db});let writes=0;
  const run=()=>simulateGateCClaimedDispatch({journal,actionId,admit:async()=>true,
   invoke:async()=>{writes++;return {success:true};},
   verify:async result=>(await verifyConfirmedLightResult({action,serviceResult:result,minObservedAtMs:initial,
    readState:async()=>({data:{entity_id:'light.fixture',state:'off',last_updated:'2026-10-10T07:59:59Z'}})})).verified,
  });
  assert.equal((await run()).status,'unverified');
  assert.equal((await run()).status,'duplicate_or_unavailable');
  assert.equal(writes,1);
 }finally{f.close();}
});
test('Gate C joined: policy exception and uncertain MCP outcome cannot execute or retry',async()=>{
 const f=fixture();try{
  const journal=createGateCExecutionJournal({dbPath:f.db});let writes=0;
  assert.equal((await simulateGateCClaimedDispatch({journal,actionId,
   admit:async()=>{throw Error('policy unavailable');},invoke:async()=>{writes++;},verify:async()=>true})).status,'denied');
  assert.equal(writes,0);
  const attempt=()=>simulateGateCClaimedDispatch({journal,actionId,admit:async()=>true,
   invoke:async()=>{writes++;throw Error('socket dropped after request sent');},verify:async()=>true});
  assert.equal((await attempt()).status,'unverified');
  assert.equal((await attempt()).status,'duplicate_or_unavailable');
  assert.equal(writes,1);
 }finally{f.close();}
});
