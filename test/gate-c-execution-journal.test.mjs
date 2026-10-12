import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createGateCExecutionJournal,simulateGateCClaimedDispatch} from '../src/decision/v3-gate-c-execution-journal.mjs';

const fixture=()=>{const dir=mkdtempSync(join(tmpdir(),'gate-c-journal-'));return {db:join(dir,'stage.db'),close:()=>rmSync(dir,{recursive:true,force:true})};};
const id='stage-approved-action-000001';
test('Gate C: durable claim survives journal restart and prevents duplicate invocation',async()=>{
 const f=fixture();try{
  const j=createGateCExecutionJournal({dbPath:f.db});let invoked=0;
  const run=journal=>simulateGateCClaimedDispatch({journal,actionId:id,admit:async()=>true,invoke:async()=>{invoked++;return {ok:true};},verify:async()=>true});
  assert.equal((await run(j)).status,'verified');
  const restored=createGateCExecutionJournal({dbPath:f.db});
  assert.equal(restored.inspect(id),'verified');
  assert.equal((await run(restored)).status,'duplicate_or_unavailable');
  assert.equal(invoked,1);
 }finally{f.close();}
});
test('Gate C: unknown result and process crash do not enable action replay',async()=>{
 const f=fixture();try{
  const j=createGateCExecutionJournal({dbPath:f.db});
  assert.equal(j.claim(id),true);
  assert.equal(createGateCExecutionJournal({dbPath:f.db}).inspect(id),'unknown');
  let writes=0;
  const result=await simulateGateCClaimedDispatch({journal:j,actionId:id,admit:async()=>true,invoke:async()=>{writes++;},verify:async()=>true});
  assert.equal(result.status,'duplicate_or_unavailable');assert.equal(writes,0);
 }finally{f.close();}
});
test('Gate C: failing, cancelled or uncertain operation never replays',async()=>{
 const f=fixture();try{
  const j=createGateCExecutionJournal({dbPath:f.db});let writes=0;
  const run=()=>simulateGateCClaimedDispatch({journal:j,actionId:id,admit:async()=>true,invoke:async()=>{writes++;throw Error('MCP timeout');},verify:async()=>true});
  assert.equal((await run()).status,'unverified');
  assert.equal((await run()).status,'duplicate_or_unavailable');
  assert.equal(j.inspect(id),'unverified');assert.equal(writes,1);
 }finally{f.close();}
});
test('Gate C: failed admission and invalid claim cannot invoke',async()=>{
 const f=fixture();try{
  const j=createGateCExecutionJournal({dbPath:f.db});let writes=0;
  for(const admit of [async()=>false,async()=>{throw Error('policy offline');}]){
   assert.equal((await simulateGateCClaimedDispatch({journal:j,actionId:id,admit,invoke:async()=>{writes++;},verify:async()=>true})).status,'denied');
  }
  assert.equal(j.inspect(id),null);
  assert.equal((await simulateGateCClaimedDispatch({journal:j,actionId:'bad',admit:async()=>true,invoke:async()=>{writes++;},verify:async()=>true})).status,'duplicate_or_unavailable');
  assert.equal(writes,0);
 }finally{f.close();}
});
test('Gate C: independent SQLite processes reject replay across restart',()=>{
 const f=fixture();try{
  createGateCExecutionJournal({dbPath:f.db});
  const script=`import {createGateCExecutionJournal} from '${new URL('../src/decision/v3-gate-c-execution-journal.mjs',import.meta.url).href}';process.stdout.write(String(createGateCExecutionJournal({dbPath:process.argv[1]}).claim(process.argv[2])));`;
  const first=spawnSync(process.execPath,['--input-type=module','-e',script,f.db,id],{encoding:'utf8'});
  const second=spawnSync(process.execPath,['--input-type=module','-e',script,f.db,id],{encoding:'utf8'});
  assert.equal(first.status,0);assert.equal(second.status,0);
  assert.deepEqual([first.stdout,second.stdout],['true','false']);
 }finally{f.close();}
});
test('Gate C: journal refuses implicit production storage and malformed identifiers',()=>{
 assert.throws(()=>createGateCExecutionJournal(),/invalid_journal_path/);
 assert.throws(()=>createGateCExecutionJournal({dbPath:'data/bot.db'}),/invalid_journal_path/);
 const f=fixture();try{const j=createGateCExecutionJournal({dbPath:f.db});
  assert.equal(j.claim("x'); DROP TABLE gate_c_execution_claims;--"),false);
  assert.equal(j.mark('short','verified'),false);
  assert.equal(j.mark(id,'retry'),false);
 }finally{f.close();}
});
