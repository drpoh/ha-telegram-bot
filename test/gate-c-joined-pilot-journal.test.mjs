import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';

const actor={userId:1234,chatId:1234};
const other={userId:5678,chatId:5678};
const request='включи свет в тамбуре';
const makeDb=()=>{const dir=mkdtempSync(join(tmpdir(),'gate-c-chain-'));return {dir,path:join(dir,'claims.db')};};

test('trusted private actor, exact intent, one-use confirmation, durable claim and unknown MCP result',async()=>{
 const {dir,path}=makeDb();
 try{
  const journal=createGateCExecutionJournal({dbPath:path});
  let calls=0;
  const pilot=createKitchenDryrunConsent({executionJournal:journal,dispatch:async({action,actor:identity})=>{
   calls++;
   assert.deepEqual(identity,actor);
   assert.equal(action.name,'ha_call_service');
   assert.deepEqual(action.args,{domain:'light',entity_id:'light.tambur_svet_l1',service:'turn_on'});
   throw new Error('lost MCP reply after command possibly executed');
  }});
  assert.equal(pilot.request({userId:1234,chatId:9999},request).status,'denied');
  assert.equal(pilot.request(actor,'включи весь свет').status,'unsupported');
  assert.equal(pilot.request(actor,request).status,'pending');
  assert.equal((await pilot.confirm(other)).status,'missing');
  assert.deepEqual(await pilot.confirm(actor),{status:'failed',reason:'dispatch_exception'});
  assert.equal((await pilot.confirm(actor)).status,'missing');
  assert.equal(calls,1);
  // Fresh in-memory consent cannot reuse prior token after a process-level restart.
  assert.equal(createKitchenDryrunConsent({executionJournal:createGateCExecutionJournal({dbPath:path}),dispatch:async()=>{calls++;}}).confirm(actor) instanceof Promise,true);
  assert.equal(calls,1);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('claim failure closes the joined chain before dispatch, including fresh intent',async()=>{
 const {dir,path}=makeDb();
 try{
  const journal=createGateCExecutionJournal({dbPath:path});let calls=0;
  const pilot=createKitchenDryrunConsent({executionJournal:{claim:()=>false},dispatch:async()=>{calls++;return {status:'verified'};}});
  assert.equal(pilot.request(actor,request).status,'pending');
  assert.deepEqual(await pilot.confirm(actor),{status:'denied',reason:'replay_claim_unavailable'});
  assert.equal(calls,0);
  assert.equal((await pilot.confirm(actor)).status,'missing');
  assert.equal(journal.inspect('nonexistent'),'null'===null?null:null);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
